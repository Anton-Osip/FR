import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Определение слоев FSD (сверху вниз)
const FSD_LAYERS = {
  app: 0,
  pages: 1,
  widgets: 2,
  features: 3,
  entities: 4,
  shared: 5,
};

// Алиасы проекта
const ALIASES = {
  '@app': 'app',
  '@pages': 'pages',
  '@widgets': 'widgets',
  '@shared': 'shared',
  '@assets': 'assets',
  '@': 'src',
};

const errors = [];
const warnings = [];

/**
 * Определяет слой файла по его пути
 */
function getLayerFromPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Проверяем прямые пути к слоям
  for (const [layer] of Object.entries(FSD_LAYERS)) {
    if (normalizedPath.includes(`/${layer}/`) || normalizedPath.includes(`\\${layer}\\`)) {
      return layer;
    }
  }
  
  return null;
}

/**
 * Определяет slice (имя папки внутри слоя) из пути
 * Например: src/widgets/header/Header.tsx -> "header"
 */
function getSliceFromPath(filePath, layer) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const layerIndex = normalizedPath.indexOf(`/${layer}/`);
  
  if (layerIndex === -1) {
    return null;
  }
  
  // Берем часть пути после слоя
  const afterLayer = normalizedPath.substring(layerIndex + layer.length + 2);
  const parts = afterLayer.split('/');
  
  // Первая папка после слоя - это slice
  return parts[0] || null;
}

/**
 * Определяет слой и slice из алиаса импорта
 * Возвращает объект { layer, slice }
 */
function getLayerAndSliceFromAlias(importPath, currentFilePath, projectRoot) {
  // Проверяем алиасы
  for (const [alias, layer] of Object.entries(ALIASES)) {
    if (importPath.startsWith(alias)) {
      if (layer === 'src' || layer === 'assets') {
        // Для @ и @assets нужно проверить дальше
        const rest = importPath.replace(alias, '').replace(/^\//, '');
        const fullPath = path.join(projectRoot, 'src', rest);
        const detectedLayer = getLayerFromPath(fullPath);
        if (detectedLayer) {
          return {
            layer: detectedLayer,
            slice: getSliceFromPath(fullPath, detectedLayer),
            path: fullPath,
          };
        }
      } else {
        // Для прямых алиасов (@widgets, @pages и т.д.)
        const rest = importPath.replace(alias, '').replace(/^\//, '');
        const fullPath = path.join(projectRoot, 'src', layer, rest);
        return {
          layer,
          slice: getSliceFromPath(fullPath, layer),
          path: fullPath,
        };
      }
    }
  }
  
  // Проверяем относительные пути
  if (importPath.startsWith('.')) {
    // Разрешаем относительный путь до абсолютного
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, importPath);
    const detectedLayer = getLayerFromPath(resolvedPath);
    if (detectedLayer) {
      return {
        layer: detectedLayer,
        slice: getSliceFromPath(resolvedPath, detectedLayer),
        path: resolvedPath,
      };
    }
  }
  
  // Внешние зависимости
  if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
    return { layer: 'external', slice: null, path: null };
  }
  
  return { layer: null, slice: null, path: null };
}

/**
 * Извлекает импорты из TypeScript файла
 */
function extractImports(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  
  const imports = [];
  
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const importPath = moduleSpecifier.text;
        const isTypeOnly = node.importClause?.isTypeOnly || false;
        
        imports.push({
          path: importPath,
          isTypeOnly,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          node,
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  return imports;
}

/**
 * Проверяет, разрешен ли импорт между слоями и slices
 */
function isImportAllowed(fromLayer, fromSlice, toLayer, toSlice) {
  if (!fromLayer || !toLayer || toLayer === 'external') {
    return true; // Внешние зависимости всегда разрешены
  }
  
  const fromLevel = FSD_LAYERS[fromLayer];
  const toLevel = FSD_LAYERS[toLayer];
  
  if (fromLevel === undefined || toLevel === undefined) {
    return true; // Неизвестные слои пропускаем
  }
  
  // Если импортируем из того же слоя
  if (fromLayer === toLayer) {
    // Разрешаем только если это тот же slice (внутренние импорты)
    if (fromSlice && toSlice && fromSlice === toSlice) {
      return true; // Можно импортировать внутри одного slice
    }
    // Исключение: слои app и shared могут импортировать друг из друга
    if (fromLayer === 'app' || fromLayer === 'shared') {
      return true;
    }
    // Запрещаем импорт из другого slice в том же слое
    return false;
  }
  
  // Слой может импортировать только из слоев ниже (больший уровень)
  return toLevel > fromLevel;
}

/**
 * Проверяет использование public API (index.ts)
 */
function checkPublicApi(currentFilePath, importPath, projectRoot) {
  // Пропускаем внешние зависимости и относительные импорты без расширения
  if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
    return true;
  }
  
  // Разрешаем путь импорта
  let resolvedImportPath;
  
  if (importPath.startsWith('@')) {
    // Алиас - разрешаем относительно src
    const aliasPath = importPath.replace(/^@/, '').replace(/^\//, '');
    resolvedImportPath = path.join(projectRoot, 'src', aliasPath);
  } else if (importPath.startsWith('.')) {
    // Относительный путь
    const currentDir = path.dirname(currentFilePath);
    resolvedImportPath = path.resolve(currentDir, importPath);
  } else {
    return true;
  }
  
  // Если импорт указывает на конкретный файл .ts/.tsx
  if (importPath.endsWith('.ts') || importPath.endsWith('.tsx')) {
    const importDir = path.dirname(resolvedImportPath);
    const indexPath = path.join(importDir, 'index.ts');
    
    // Проверяем, существует ли index.ts в той же директории
    if (fs.existsSync(indexPath)) {
      return false; // Нарушение: должен использоваться index.ts
    }
  }
  
  return true;
}

/**
 * Рекурсивно находит все TypeScript файлы
 */
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Пропускаем node_modules и dist
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Основная функция проверки
 */
function checkFSD(targetPath = 'src') {
  const projectRoot = path.resolve(__dirname, '..');
  const checkPath = path.isAbsolute(targetPath) 
    ? targetPath 
    : path.join(projectRoot, targetPath);
  
  if (!fs.existsSync(checkPath)) {
    console.error(`❌ Путь "${checkPath}" не существует`);
    process.exit(1);
  }
  
  const files = fs.statSync(checkPath).isFile() 
    ? [checkPath]
    : findTsFiles(checkPath);
  
  console.log(`🔍 Проверка ${files.length} файлов...\n`);
  
  files.forEach(filePath => {
    const fromLayer = getLayerFromPath(filePath);
    
    if (!fromLayer) {
      return; // Пропускаем файлы вне слоев FSD
    }
    
    const imports = extractImports(filePath);
    
    const fromSlice = getSliceFromPath(filePath, fromLayer);
    
    imports.forEach(imp => {
      const { layer: toLayer, slice: toSlice } = getLayerAndSliceFromAlias(imp.path, filePath, projectRoot);
      
      if (toLayer === 'external') {
        return; // Пропускаем внешние зависимости
      }
      
      // Проверка правил импортов между слоями и slices
      if (toLayer && !isImportAllowed(fromLayer, fromSlice, toLayer, toSlice)) {
        const relativePath = path.relative(projectRoot, filePath);
        let message = `❌ Нарушение FSD: слой "${fromLayer}"`;
        
        if (fromSlice) {
          message += ` (slice "${fromSlice}")`;
        }
        
        message += ` не может импортировать из слоя "${toLayer}"`;
        
        if (toSlice) {
          message += ` (slice "${toSlice}")`;
        }
        
        if (fromLayer === toLayer && fromSlice !== toSlice) {
          message += ` - нельзя импортировать из другого slice в том же слое`;
        }
        
        errors.push({
          file: relativePath,
          line: imp.line,
          message,
          import: imp.path,
        });
      }
      
      // Проверка использования public API
      if (!checkPublicApi(filePath, imp.path, projectRoot)) {
        const relativePath = path.relative(projectRoot, filePath);
        warnings.push({
          file: relativePath,
          line: imp.line,
          message: `⚠️  Рекомендуется использовать public API через index.ts вместо прямого импорта`,
          import: imp.path,
        });
      }
    });
  });
  
  // Вывод результатов
  console.log('📊 Результаты проверки:\n');
  
  if (errors.length > 0) {
    console.log(`❌ Найдено ошибок: ${errors.length}\n`);
    errors.forEach(error => {
      console.log(`${error.file}:${error.line}`);
      console.log(`  ${error.message}`);
      console.log(`  Импорт: ${error.import}\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  Найдено предупреждений: ${warnings.length}\n`);
    warnings.forEach(warning => {
      console.log(`${warning.file}:${warning.line}`);
      console.log(`  ${warning.message}`);
      console.log(`  Импорт: ${warning.import}\n`);
    });
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Все проверки пройдены успешно!\n');
  }
  
  // Возвращаем код выхода
  return errors.length === 0 ? 0 : 1;
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const targetPath = args[0] || 'src';
const shouldFix = args.includes('--fix');

if (shouldFix) {
  console.log('ℹ️  Режим автоматического исправления пока не реализован\n');
}

const exitCode = checkFSD(targetPath);
process.exit(exitCode);

