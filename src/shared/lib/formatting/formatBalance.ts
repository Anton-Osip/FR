/**
 * Форматирует баланс в строку с округлением вниз до целого числа.
 * Использует русскую локаль для форматирования чисел.
 *
 * @param value - Числовое значение баланса
 * @returns Отформатированная строка с разделителями тысяч
 *
 * @example
 * formatBalance(1234.9) // "1 235"
 * formatBalance(999.1) // "999"
 */
export const formatBalance = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(value));
};
