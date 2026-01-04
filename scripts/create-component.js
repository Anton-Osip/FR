import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Преобразует первую букву строки в нижний регистр
 * @param {string} str - Исходная строка
 * @returns {string} Строка с первой буквой в нижнем регистре
 */
function toLowerCaseFirst(str) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Преобразует имя компонента в имя класса для CSS
 * @param {string} componentName - Имя компонента
 * @returns {string} Имя класса в camelCase
 */
function toCamelCase(componentName) {
  return componentName.charAt(0).toLowerCase() + componentName.slice(1);
}

/**
 * Вычисляет относительный путь к файлу переменных SCSS
 * @param {string} componentDir - Полный путь к директории компонента
 * @returns {string} Относительный путь к variables.scss
 */
function getVariablesPath(componentDir) {
  const projectRoot = path.resolve(__dirname, '..');
  const srcPath = path.join(projectRoot, 'src');
  const variablesPath = path.join(srcPath, 'shared', 'styles', 'variables');
  
  // Вычисляем относительный путь
  const relativePath = path.relative(componentDir, variablesPath);
  
  // Нормализуем путь для использования в SCSS (заменяем обратные слеши на прямые)
  return relativePath.split(path.sep).join('/');
}

/**
 * Создает шаблон компонента React
 * @param {string} componentName - Имя компонента
 * @returns {string} Шаблон компонента
 */
function createComponentTemplate(componentName) {
  const className = toCamelCase(componentName);
  return `import { type FC } from 'react';

import styles from './${componentName}.module.scss';

interface ${componentName}Props {
  className?: string;
  // добавьте пропсы компонента здесь
}

export const ${componentName}: FC<${componentName}Props> = ({ className }) => {
  return <div className={\`\${styles.${className}} \${className || ''}\`}>${componentName}</div>;
};
`;
}

/**
 * Создает шаблон файла стилей
 * @param {string} componentName - Имя компонента
 * @param {string} variablesPath - Относительный путь к файлу переменных
 * @returns {string} Шаблон стилей
 */
function createStylesTemplate(componentName, variablesPath) {
  const className = toCamelCase(componentName);
  return `@use "${variablesPath}" as *;

.${className} {
  // стили компонента
}
`;
}

/**
 * Создает шаблон index.ts для реэкспорта
 * @param {string} componentName - Имя компонента
 * @returns {string} Шаблон index.ts
 */
function createIndexTemplate(componentName) {
  return `export { ${componentName} } from './${componentName}';
`;
}

/**
 * Создает структуру компонента
 * @param {string} componentName - Имя компонента
 * @param {string} targetPath - Путь, где создавать компонент
 */
function createComponent(componentName, targetPath) {
  // Валидация аргументов
  if (!componentName) {
    console.error('❌ Ошибка: Не указано имя компонента');
    console.log('Использование: node scripts/create-component.js <ComponentName> <targetPath>');
    process.exit(1);
  }

  if (!targetPath) {
    console.error('❌ Ошибка: Не указан путь для создания компонента');
    console.log('Использование: node scripts/create-component.js <ComponentName> <targetPath>');
    process.exit(1);
  }

  // Преобразование имен
  const folderName = toLowerCaseFirst(componentName);
  const componentFileName = `${componentName}.tsx`;
  const stylesFileName = `${componentName}.module.scss`;
  const indexFileName = 'index.ts';

  // Определение полного пути
  const basePath = path.isAbsolute(targetPath) 
    ? targetPath 
    : path.resolve(__dirname, '..', targetPath);
  
  const componentDir = path.join(basePath, folderName);

  // Проверка существования целевой директории
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Ошибка: Директория "${basePath}" не существует`);
    process.exit(1);
  }

  // Проверка, не существует ли уже папка с таким именем
  if (fs.existsSync(componentDir)) {
    console.error(`❌ Ошибка: Папка "${componentDir}" уже существует`);
    process.exit(1);
  }

  try {
    // Создание директории компонента
    fs.mkdirSync(componentDir, { recursive: true });
    console.log(`✓ Создана папка: ${componentDir}`);

    // Создание файла компонента
    const componentPath = path.join(componentDir, componentFileName);
    fs.writeFileSync(componentPath, createComponentTemplate(componentName), 'utf-8');
    console.log(`✓ Создан файл: ${componentPath}`);

    // Создание файла стилей
    const stylesPath = path.join(componentDir, stylesFileName);
    const variablesPath = getVariablesPath(componentDir);
    fs.writeFileSync(stylesPath, createStylesTemplate(componentName, variablesPath), 'utf-8');
    console.log(`✓ Создан файл: ${stylesPath}`);

    // Создание файла index.ts
    const indexPath = path.join(componentDir, indexFileName);
    fs.writeFileSync(indexPath, createIndexTemplate(componentName), 'utf-8');
    console.log(`✓ Создан файл: ${indexPath}`);

    console.log(`\n✅ Компонент "${componentName}" успешно создан в "${componentDir}"`);
  } catch (error) {
    console.error(`❌ Ошибка при создании компонента: ${error.message}`);
    process.exit(1);
  }
}

// Получение аргументов командной строки
const args = process.argv.slice(2);
const componentName = args[0];
const targetPath = args[1];

// Запуск создания компонента
createComponent(componentName, targetPath);

