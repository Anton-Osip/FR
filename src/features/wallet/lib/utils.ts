import type { WithdrawMethod } from '../model';

/**
 * Извлекает минимальную сумму вывода из метода вывода
 * @param method - Метод вывода средств
 * @returns Минимальная сумма вывода или 0, если не указана
 */
export const getMinAmount = (method: WithdrawMethod): number => {
  if ('min' in method) {
    if (typeof method.min === 'number') {
      return method.min;
    }
    if (typeof method.min === 'string') {
      const parsed = Number.parseFloat(method.min);

      return !Number.isNaN(parsed) ? parsed : 0;
    }
  }

  return 0;
};

/**
 * Парсит строковое значение суммы в число
 * @param amountValue - Значение суммы (может быть строкой или числом)
 * @returns Распарсенное число или NaN, если значение некорректно
 */
export const parseAmount = (amountValue: unknown): number => {
  const amountStr = typeof amountValue === 'string' ? amountValue : String(amountValue ?? '');

  return Number.parseFloat(amountStr);
};

const MIN_NUMBER = 0.000001;
const TO_EXPONENTIAL = 2;
const PRECISION_NUMBER = 6;

export const formatCryptoAmount = (value: number | string, precision: number = PRECISION_NUMBER): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  // Для очень маленьких чисел
  if (num > 0 && num < MIN_NUMBER) {
    return num.toExponential(TO_EXPONENTIAL);
  }

  // Преобразуем в строку с максимальной точностью
  const numStr = num.toString();

  // Разделяем на целую и дробную части
  const [integerPart, fractionalPart = ''] = numStr.split('.');

  // Обрезаем дробную часть до нужной точности
  const truncatedFractional = fractionalPart.slice(0, precision);

  // Формируем результат
  let result = truncatedFractional ? `${integerPart}.${truncatedFractional}` : integerPart;

  // Убираем лишние нули в конце дробной части, но сохраняем "0"
  if (result === '0') {
    return '0';
  }

  result = result.replace(/\.?0+$/, '');

  return result;
};
