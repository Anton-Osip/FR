import { DEFAULT_CURRENCY_SYMBOL } from '@shared/config';

import type { Currency } from '@/shared/model/types/currency';

/**
 * Возвращает символ валюты из объекта Currency или значение по умолчанию.
 *
 * @param currency - Объект валюты (может быть undefined/null)
 * @returns Символ валюты или DEFAULT_CURRENCY_SYMBOL
 */
export const getCurrencySymbol = (currency?: Currency | null): string =>
  currency?.symbol?.trim() || DEFAULT_CURRENCY_SYMBOL;
