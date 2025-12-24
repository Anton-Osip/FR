import type { TelegramWebApp } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry/feLogger';

const WAIT_WEBAPP_TIMEOUT_MS = 2000;
const CHECK_INTERVAL_MS = 50;
const INIT_DATA_TIMEOUT_MS = 2000;
const INIT_DATA_INTERVAL_MS = 50;
const INIT_DATA_LOG_INTERVAL_MS = 250;

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getInitData(): string {
  if (typeof window === 'undefined') return '';
  const w = window as Window;
  const initData = w.Telegram?.WebApp?.initData;

  if (typeof initData === 'string' && initData.length > 0) return initData;
  const fromSearch = (() => {
    try {
      return new URLSearchParams(w.location.search).get('tgWebAppData') || '';
    } catch {
      return '';
    }
  })();

  if (fromSearch) return fromSearch;

  return (() => {
    try {
      const h = w.location.hash?.startsWith('#') ? w.location.hash.slice(1) : '';

      return h ? new URLSearchParams(h).get('tgWebAppData') || '' : '';
    } catch {
      return '';
    }
  })();
}

/**
 * Проверка факта запуска внутри Telegram (наличие `window.Telegram.WebApp`).
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;

  return !!window.Telegram?.WebApp;
}

/**
 * Ожидает появления `window.Telegram.WebApp` в разумный таймаут.
 */
export function waitForTelegramWebApp(timeout = WAIT_WEBAPP_TIMEOUT_MS): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(false);

      return;
    }
    if (window.Telegram?.WebApp) {
      resolve(true);

      return;
    }
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.Telegram?.WebApp) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, CHECK_INTERVAL_MS);
  });
}

/**
 * Best-effort ожидание Telegram WebApp `initData` (или `tgWebAppData` в URL).
 * Возвращает пустую строку по таймауту.
 */
export function waitForInitData(timeout = INIT_DATA_TIMEOUT_MS, intervalMs = INIT_DATA_INTERVAL_MS): Promise<string> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve('');

      return;
    }
    const w = window as Window;
    const started = Date.now();
    let lastLogAt = 0;
    let attempts = 0;
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const snapshot = () => {
      const hasTelegram = !!w.Telegram;
      const hasWebApp = !!w.Telegram?.WebApp;
      const tgInitDataLen = typeof w.Telegram?.WebApp?.initData === 'string' ? w.Telegram.WebApp.initData.length : 0;
      const q = (() => {
        try {
          return new URLSearchParams(w.location.search);
        } catch {
          return new URLSearchParams('');
        }
      })();
      const h = (() => {
        try {
          const s = w.location.hash?.startsWith('#') ? w.location.hash.slice(1) : '';

          return new URLSearchParams(s || '');
        } catch {
          return new URLSearchParams('');
        }
      })();
      const qLen = (q.get('tgWebAppData') || '').length;
      const hLen = (h.get('tgWebAppData') || '').length;

      return {
        hasTelegram,
        hasWebApp,
        webAppVersion: w.Telegram?.WebApp?.version || null,
        webAppPlatform: w.Telegram?.WebApp?.platform || null,
        tgInitDataLen,
        tgWebAppDataSearchLen: qLen,
        tgWebAppDataHashLen: hLen,
      };
    };

    feLog.debug('telegram.init_data.wait_start', {
      timeout_ms: timeout,
      interval_ms: intervalMs,
      ...snapshot(),
    });
    const tick = (): void => {
      attempts++;
      const v = getInitData();

      if (v) {
        const elapsed = Date.now() - started;
        const s = snapshot();

        feLog.debug('telegram.init_data.ready', {
          elapsed_ms: elapsed,
          attempts,
          initDataLength: v.length,
          source:
            s.tgInitDataLen > 0
              ? 'telegram.WebApp.initData'
              : s.tgWebAppDataSearchLen > 0
                ? 'url.search.tgWebAppData'
                : 'url.hash.tgWebAppData',
          ...s,
        });
        resolve(v);

        return;
      }
      const elapsed = Date.now() - started;

      if (elapsed >= timeout) {
        feLog.warn('telegram.init_data.timeout', { elapsed_ms: elapsed, attempts, ...snapshot() });
        resolve('');

        return;
      }
      if (elapsed - lastLogAt >= INIT_DATA_LOG_INTERVAL_MS) {
        lastLogAt = elapsed;
        feLog.debug('telegram.init_data.waiting', { elapsed_ms: elapsed, attempts, ...snapshot() });
      }
      setTimeout(tick, intervalMs);
    };

    tick();
  });
}

export function getTelegramLoginWidgetData(): {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
} | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const hash = params.get('hash');
  const auth_date = params.get('auth_date');

  if (!id || !hash || !auth_date) return null;

  return {
    id,
    first_name: params.get('first_name') || undefined,
    last_name: params.get('last_name') || undefined,
    username: params.get('username') || undefined,
    photo_url: params.get('photo_url') || undefined,
    auth_date,
    hash,
  };
}
