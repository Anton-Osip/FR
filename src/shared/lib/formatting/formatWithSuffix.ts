import { parseFormattedAmount } from './parseFormattedAmount';

const THOUSAND_DIVISOR = 1_000;
const MILLION_DIVISOR = 1_000_000;
const LARGE_NUMBER_THRESHOLD = 100;
const SIGNIFICANT_DIGITS = 3;

export const formatWithSuffix = (value: number | string): string => {
  const numericValue = parseFormattedAmount(value);
  const abs = Math.abs(numericValue);

  let suffix = '';
  let divisor = 1;

  if (abs >= MILLION_DIVISOR) {
    suffix = 'M';
    divisor = MILLION_DIVISOR;
  } else if (abs >= THOUSAND_DIVISOR && abs < MILLION_DIVISOR) {
    suffix = 'K';
    divisor = THOUSAND_DIVISOR;
  }

  const base = abs / divisor;

  const formattedBase =
    base >= LARGE_NUMBER_THRESHOLD
      ? Math.floor(base).toString()
      : Number.parseFloat(base.toPrecision(SIGNIFICANT_DIGITS)).toString();

  return `${formattedBase}${suffix}`;
};
