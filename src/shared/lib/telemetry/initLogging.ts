import { type CLSMetric, type INPMetric, type LCPMetric, onCLS, onINP, onLCP } from 'web-vitals';

import { feLog } from './feLogger';

declare global {
  interface Window {
    __skylon_logging_inited?: boolean;
  }
}

function toErrorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string') return reason;
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

const MODULE_RELOAD_KEY = '__skylon_module_reload_count';
const MAX_RELOAD_ATTEMPTS = 2;
const RELOAD_DELAY_MS = 100;

// Ключевые слова для определения ошибок загрузки модуля
const MODULE_ERROR_KEYWORDS = [
  'error loading dynamically imported module',
  'MIME type',
  'was blocked due to an unresolved MIME-type',
  'Загрузка модуля по адресу',
] as const;

/**
 * Извлекает URL из сообщения об ошибке
 */
function extractUrlFromMessage(message: string): string | undefined {
  // Ищем URL в формате https://... или http://... с расширением .js
  const urlMatch = message.match(/https?:\/\/[^\s"'<>]+\.js(?:\?[^\s"'<>]*)?/i);

  return urlMatch ? urlMatch[0] : undefined;
}

/**
 * Нормализует ошибку в строку для логирования
 */
function normalizeError(error: Error | string): string {
  return typeof error === 'string' ? error : error.message;
}

/**
 * Определяет, является ли ошибка ошибкой загрузки модуля с устаревшим хэшем
 */
function isModuleLoadError(error: Error | string, url?: string): boolean {
  const errorMessage = normalizeError(error);

  // Извлекаем URL из сообщения, если он не передан явно
  const errorUrl = url || extractUrlFromMessage(errorMessage);

  // Проверяем сообщение об ошибке на наличие ключевых слов
  const hasModuleErrorKeywords = MODULE_ERROR_KEYWORDS.some(keyword => errorMessage.includes(keyword));

  // Проверяем URL (если доступен) - файл из assets с расширением .js
  const isAssetJsFile = errorUrl ? errorUrl.includes('/assets/') && errorUrl.endsWith('.js') : false;

  // Проверяем тип ошибки
  const isTypeError = error instanceof TypeError;

  // Ошибка загрузки модуля определяется:
  // 1. По ключевым словам в сообщении (любой тип ошибки)
  // 2. По URL файла из assets И типу TypeError
  return hasModuleErrorKeywords || (isAssetJsFile && isTypeError);
}

/**
 * Обрабатывает ошибку загрузки модуля, перезагружая страницу с защитой от зацикливания
 */
function handleModuleLoadError(error: Error | string, url?: string): void {
  if (typeof sessionStorage === 'undefined') {
    // Если sessionStorage недоступен, просто перезагружаем без счетчика
    feLog.warn('module_load_error.reloading_page_no_storage', {
      error: normalizeError(error),
      url,
    });
    setTimeout(() => {
      window.location.reload();
    }, RELOAD_DELAY_MS);

    return;
  }

  try {
    const reloadCount = parseInt(sessionStorage.getItem(MODULE_RELOAD_KEY) || '0', 10);

    if (reloadCount >= MAX_RELOAD_ATTEMPTS) {
      feLog.error('module_load_error.max_reload_attempts_reached', {
        count: reloadCount,
        error: normalizeError(error),
        url,
      });

      return;
    }

    const newCount = reloadCount + 1;

    sessionStorage.setItem(MODULE_RELOAD_KEY, String(newCount));

    feLog.warn('module_load_error.reloading_page', {
      attempt: newCount,
      maxAttempts: MAX_RELOAD_ATTEMPTS,
      error: normalizeError(error),
      url,
    });

    // Небольшая задержка перед перезагрузкой, чтобы логи успели отправиться
    setTimeout(() => {
      window.location.reload();
    }, RELOAD_DELAY_MS);
  } catch (e) {
    // Если не удалось использовать sessionStorage, перезагружаем без счетчика
    feLog.error('module_load_error.reload_failed', {
      error: normalizeError(error),
      storageError: e instanceof Error ? e.message : String(e),
      url,
    });
    setTimeout(() => {
      window.location.reload();
    }, RELOAD_DELAY_MS);
  }
}

/**
 * Инициализирует клиентскую телеметрию: window errors, unhandled rejections и web-vitals.
 * Повторный вызов безопасен (однократная инициализация).
 */
export const initLogging = (): void => {
  if (typeof window === 'undefined') return;
  if (window.__skylon_logging_inited) return;
  window.__skylon_logging_inited = true;

  window.addEventListener('error', e => {
    feLog.error('window.error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });

    // Проверяем, является ли это ошибкой загрузки модуля
    const error = e.error || e.message;

    if (isModuleLoadError(error, e.filename)) {
      handleModuleLoadError(error, e.filename);
    }
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const errorMessage = toErrorMessage(e.reason);

    feLog.error('unhandledrejection', { message: errorMessage });

    // Проверяем, является ли это ошибкой загрузки модуля
    // Ошибки динамического импорта обычно содержат URL в сообщении
    const error = e.reason instanceof Error ? e.reason : errorMessage;
    const extractedUrl = extractUrlFromMessage(errorMessage);

    if (isModuleLoadError(error, extractedUrl)) {
      handleModuleLoadError(error, extractedUrl);
    }
  });

  onLCP((m: LCPMetric) => feLog.info('webvitals', { metric: 'LCP', value: m.value, id: m.id }));
  onCLS((m: CLSMetric) => feLog.info('webvitals', { metric: 'CLS', value: m.value, id: m.id }));
  onINP((m: INPMetric) => feLog.info('webvitals', { metric: 'INP', value: m.value, id: m.id }));

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') feLog.flush();
  });
  window.addEventListener('beforeunload', () => feLog.flush());
};
