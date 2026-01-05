const KOPEKS_IN_RUBLE = 100;

export const formatRubles = (amountInKopeks: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInKopeks / KOPEKS_IN_RUBLE);
};
