const DECIMAL_BASE = 10;

export const parseFormattedAmount = (value: string | number): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const cleaned = trimmed.replace(/[^\d.,-]/g, '');

  if (!cleaned) {
    return 0;
  }

  const lastDotIndex = cleaned.lastIndexOf('.');
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const decimalIndex = Math.max(lastDotIndex, lastCommaIndex);

  let normalized: string;

  if (decimalIndex !== -1) {
    const integerPart = cleaned.slice(0, decimalIndex).replace(/[^\d-]/g, '');
    const fractionalPart = cleaned.slice(decimalIndex + 1).replace(/[^\d]/g, '');

    normalized = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  } else {
    normalized = cleaned.replace(/[^\d-]/g, '');
  }

  const result = Number.parseFloat(normalized);

  if (Number.isNaN(result)) {
    return 0;
  }

  return Number.parseFloat(result.toFixed(DECIMAL_BASE));
};
