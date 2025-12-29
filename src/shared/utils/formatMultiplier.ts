/**
 * Форматирует множитель с одним знаком после запятой.
 * Использует русскую локаль для форматирования чисел.
 *
 * @param value - Числовое значение множителя
 * @returns Отформатированная строка с одним знаком после запятой
 *
 * @example
 * formatMultiplier(2.5) // "2,5"
 * formatMultiplier(10) // "10,0"
 * formatMultiplier(3.14159) // "3,1"
 */
export const formatMultiplier = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};
