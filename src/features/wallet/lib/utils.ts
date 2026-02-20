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
