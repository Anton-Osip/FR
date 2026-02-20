import i18n from './i18n/i18n';

const MILLISECONDS_IN_SECOND = 1000;
const TIME_PADDING_LENGTH = 2;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

const MONTHS_RU: readonly string[] = [
  'Января',
  'Февраля',
  'Марта',
  'Апреля',
  'Мая',
  'Июня',
  'Июля',
  'Августа',
  'Сентября',
  'Октября',
  'Ноября',
  'Декабря',
] as const;

const MONTHS_EN: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

let cachedMonths: readonly string[] | null = null;
let cachedLanguage: string | null = null;

/**
 * Сбрасывает кеш месяцев
 * Полезно при смене языка приложения для принудительного обновления
 */
export const resetMonthsCache = (): void => {
  cachedMonths = null;
  cachedLanguage = null;
};

/**
 * Возвращает массив месяцев в зависимости от текущей локали
 * Использует кеширование для оптимизации производительности
 * @returns Массив названий месяцев
 */
const getMonths = (): readonly string[] => {
  const currentLanguage = i18n?.language || 'en';

  if (cachedLanguage === currentLanguage && cachedMonths !== null) {
    return cachedMonths;
  }

  cachedLanguage = currentLanguage;
  cachedMonths = currentLanguage.startsWith('ru') ? MONTHS_RU : MONTHS_EN;

  return cachedMonths;
};

/**
 * Форматирует timestamp в дату формата "1 Января" или "1 January"
 * @param timestamp - Unix timestamp в секундах
 * @returns Отформатированная дата
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * MILLISECONDS_IN_SECOND);
  const months = getMonths();

  return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Форматирует timestamp во время формата "13:10"
 * @param timestamp - Unix timestamp в секундах
 * @returns Отформатированное время
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * MILLISECONDS_IN_SECOND);
  const hours = String(date.getHours()).padStart(TIME_PADDING_LENGTH, '0');
  const minutes = String(date.getMinutes()).padStart(TIME_PADDING_LENGTH, '0');

  return `${hours}:${minutes}`;
};

/**
 * Форматирует timestamp в полную дату и время
 * @param timestamp - Unix timestamp в секундах
 * @returns Отформатированная дата и время
 */
export const formatDateTime = (timestamp: number): string => {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
};

/**
 * Форматирует timestamp в локализованную дату и время
 * @param timestamp - Unix timestamp в секундах
 * @param locale - Локаль для форматирования (по умолчанию берется из i18n)
 * @returns Отформатированная дата и время в формате DD.MM.YYYY HH:MM
 */
export const formatLocalizedDateTime = (timestamp: number, locale?: string): string => {
  const currentLocale = locale || i18n?.language || 'ru-RU';
  const date = new Date(timestamp * MILLISECONDS_IN_SECOND);

  return date.toLocaleString(currentLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматирует секунды в формат HH:MM:SS
 * @param seconds - Количество секунд
 * @returns Отформатированное время в формате HH:MM:SS
 */
export const formatSecondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  const minutes = Math.floor((seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
  const secs = Math.floor(seconds % SECONDS_IN_MINUTE);

  return `${String(hours).padStart(TIME_PADDING_LENGTH, '0')}:${String(minutes).padStart(TIME_PADDING_LENGTH, '0')}:${String(secs).padStart(TIME_PADDING_LENGTH, '0')}`;
};
