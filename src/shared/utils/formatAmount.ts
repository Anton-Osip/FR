/**
 * Форматирует сумму с разделителями тысяч (пробел) и дробной частью (запятая).
 * Использует русскую локаль для форматирования чисел.
 * Дробная часть показывается только если она есть (не показывает ",0").
 *
 * @param value - Числовое значение суммы
 * @returns Отформатированная строка с разделителями тысяч и дробной частью (если есть)
 *
 * @example
 * formatAmount(1234.5) // "1 234,5"
 * formatAmount(1000) // "1 000"
 * formatAmount(999.99) // "999,99"
 */
export const formatAmount = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
