import { feLog } from '../telemetry/feLogger';

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const CHECK_INTERVAL_MINUTES = 5;
const INITIAL_CHECK_DELAY_SECONDS = 2;
const CHECK_INTERVAL_MS = CHECK_INTERVAL_MINUTES * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND; // 5 минут
const CHECK_ON_FOCUS_DELAY_MS = MILLISECONDS_IN_SECOND; // Задержка 1 секунда после фокуса
const RELOAD_DELAY_MS = 100;
const INITIAL_CHECK_DELAY_MS = INITIAL_CHECK_DELAY_SECONDS * MILLISECONDS_IN_SECOND; // 2 секунды при загрузке страницы

let checkIntervalId: ReturnType<typeof setInterval> | null = null;
let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;
let visibilityTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isChecking = false;
let currentVersion: string | null = null;
let isInitialized = false;
let focusHandler: (() => void) | null = null;
let visibilityHandler: (() => void) | null = null;

/**
 * Получает версию приложения из index.html
 * Версия определяется по хэшу в URL скрипта или по ETag/Last-Modified
 */
async function fetchAppVersion(): Promise<string | null> {
  try {
    // Пробуем получить версию из index.html
    const htmlResponse = await fetch(window.location.origin + '/index.html', {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (htmlResponse.ok) {
      // Используем ETag или Last-Modified как версию
      const etag = htmlResponse.headers.get('ETag');
      const lastModified = htmlResponse.headers.get('Last-Modified');

      if (etag) {
        return `html:${etag}`;
      }

      if (lastModified) {
        return `html:${lastModified}`;
      }
    }

    // Если не удалось получить версию из index.html, пробуем получить содержимое
    // и извлечь хэш из главного скрипта
    try {
      const htmlContentResponse = await fetch(window.location.origin + '/index.html', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (htmlContentResponse.ok) {
        const htmlContent = await htmlContentResponse.text();
        // Ищем главный скрипт в index.html
        // Vite генерирует скрипты в формате <script type="module" src="/src/app/main.tsx">
        // или <script type="module" src="/assets/index-xxx.js">
        const scriptMatch =
          htmlContent.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i) ||
          htmlContent.match(/<script[^>]+src=["']([^"']+\.js[^"']*)["']/i);

        if (scriptMatch && scriptMatch[1]) {
          const scriptPath = scriptMatch[1].startsWith('http')
            ? scriptMatch[1]
            : window.location.origin + scriptMatch[1];

          // Проверяем версию главного скрипта
          const scriptResponse = await fetch(scriptPath, {
            method: 'HEAD',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          if (scriptResponse.ok) {
            const scriptEtag = scriptResponse.headers.get('ETag');
            const scriptLastModified = scriptResponse.headers.get('Last-Modified');

            if (scriptEtag) {
              return `script:${scriptEtag}`;
            }

            if (scriptLastModified) {
              return `script:${scriptLastModified}`;
            }
          }
        }
      }
    } catch {
      // Игнорируем ошибки при попытке получить содержимое
    }

    // Если ничего не получилось, возвращаем null
    // Использование Date.now() может привести к ложным срабатываниям
    return null;
  } catch (error) {
    feLog.warn('update_checker.fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}

/**
 * Проверяет наличие новой версии приложения
 */
async function checkForUpdate(): Promise<void> {
  if (isChecking) {
    return;
  }

  isChecking = true;

  try {
    const newVersion = await fetchAppVersion();

    if (!newVersion) {
      isChecking = false;

      return;
    }

    if (currentVersion === null) {
      // Первая проверка - сохраняем текущую версию
      currentVersion = newVersion;
      feLog.debug('update_checker.version_initialized', { version: newVersion });
      isChecking = false;

      return;
    }

    if (currentVersion !== newVersion) {
      // Обнаружена новая версия
      feLog.info('update_checker.new_version_detected', {
        oldVersion: currentVersion,
        newVersion,
      });

      // Перезагружаем страницу
      setTimeout(() => {
        window.location.reload();
      }, RELOAD_DELAY_MS);
    }
  } catch (error) {
    feLog.error('update_checker.check_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    isChecking = false;
  }
}

/**
 * Инициализирует проверку обновлений
 */
export function initUpdateChecker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Защита от повторной инициализации
  if (isInitialized) {
    feLog.warn('update_checker.already_initialized');

    return;
  }

  isInitialized = true;

  // Проверяем при загрузке страницы (с небольшой задержкой)
  setTimeout(() => {
    void checkForUpdate();
  }, INITIAL_CHECK_DELAY_MS);

  // Периодическая проверка
  checkIntervalId = setInterval(() => {
    void checkForUpdate();
  }, CHECK_INTERVAL_MS);

  // Проверка при возврате фокуса на окно
  focusHandler = (): void => {
    // Очищаем предыдущий таймаут, если он есть
    if (focusTimeoutId) {
      clearTimeout(focusTimeoutId);
    }

    // Проверяем с задержкой, чтобы не нагружать при частых переключениях
    focusTimeoutId = setTimeout(() => {
      void checkForUpdate();
    }, CHECK_ON_FOCUS_DELAY_MS);
  };

  window.addEventListener('focus', focusHandler);

  // Проверка при видимости страницы
  visibilityHandler = (): void => {
    if (document.visibilityState === 'visible') {
      // Очищаем предыдущий таймаут, если он есть
      if (visibilityTimeoutId) {
        clearTimeout(visibilityTimeoutId);
      }

      visibilityTimeoutId = setTimeout(() => {
        void checkForUpdate();
      }, CHECK_ON_FOCUS_DELAY_MS);
    }
  };

  document.addEventListener('visibilitychange', visibilityHandler);

  feLog.debug('update_checker.initialized', {
    checkIntervalMs: CHECK_INTERVAL_MS,
  });
}

/**
 * Останавливает проверку обновлений
 */
export function stopUpdateChecker(): void {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }

  if (focusTimeoutId) {
    clearTimeout(focusTimeoutId);
    focusTimeoutId = null;
  }

  if (visibilityTimeoutId) {
    clearTimeout(visibilityTimeoutId);
    visibilityTimeoutId = null;
  }

  if (focusHandler) {
    window.removeEventListener('focus', focusHandler);
    focusHandler = null;
  }

  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }

  isInitialized = false;
  currentVersion = null;
  isChecking = false;
}

/**
 * Экспорт для тестирования (только в dev-режиме)
 * Позволяет вручную вызвать проверку обновлений из консоли браузера
 */
if (import.meta.env.DEV) {
  (
    window as Window & { testUpdateChecker?: { check: () => void; getVersion: () => string | null } }
  ).testUpdateChecker = {
    check: () => {
      void checkForUpdate();
    },
    getVersion: () => currentVersion,
  };
}
