const HOURS_IN_DAY = 24;

export const formatHours = (hours: number, locale: string): string => {
  if (!hours || hours === 0) return '0 ч';

  if (hours < HOURS_IN_DAY) {
    return `${hours} ч`;
  }

  const days = Math.floor(hours / HOURS_IN_DAY);
  const remainingHours = hours % HOURS_IN_DAY;

  const normalizedLocale = locale.toLowerCase();
  const isRussian = normalizedLocale.startsWith('ru');

  if (isRussian) {
    if (remainingHours === 0) {
      return `${days} д`;
    }

    return `${days} д ${remainingHours} ч`;
  } else {
    if (remainingHours === 0) {
      return `${days} d`;
    }

    return `${days} d ${remainingHours} h`;
  }
};
