'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { authenticateTelegramLoginWidget, authenticateTelegramWebApp } from '@/features/auth/api';
import { getUserBalance, getUserMe } from '@/features/user/api';
import { BFF, CLIENT_VERSION, LOGIN_HOSTNAME, LOGIN_RETURN_TO_HOSTS } from '@/shared/config/constants';
import { collectClientProfilePayload } from '@/shared/fingerprint';
import type { AppMode, AuthStatus, BalanceStreamPayload, TelegramLoginWidgetData, UserMe } from '@/shared/schemas';
import {
  getTelegramLoginWidgetData,
  isTelegramWebApp,
  waitForInitData,
  waitForTelegramWebApp,
} from '@/shared/telegram';
import { feLog } from '@/shared/telemetry/feLogger';
export type { AppMode, AuthStatus } from '@/shared/schemas';

type UseAuthFlowResult = {
  authStatus: AuthStatus;
  errorMessage: string;
  me: UserMe | null;
  mode: AppMode;
  showSiteLogin: () => void;
};

const TELEGRAM_WEBAPP_WAIT_MS = 4000;
const TELEGRAM_INITDATA_WEBAPP_TIMEOUT_MS = 4000;
const TELEGRAM_INITDATA_SITE_TIMEOUT_MS = 1500;
const BALANCE_SYNC_THROTTLE_MS = 3000;
const BALANCE_STREAM_RECONNECT_BASE_MS = 500;
const BALANCE_STREAM_RECONNECT_EXPONENT = 1.8;
const BALANCE_STREAM_RECONNECT_MAX_MS = 15000;

function parseBalancePayload(data: unknown): BalanceStreamPayload | null {
  if (!data || typeof data !== 'object') return null;
  const v = (data as Record<string, unknown>).balance;

  if (typeof v !== 'number' || !Number.isFinite(v)) return null;

  return { balance: v };
}

/**
 * Удаляет параметры Telegram Login Widget / WebApp из URL, чтобы не светить PII и не мешать повторной инициализации.
 * Без изменения логики страницы (replaceState).
 */
function stripTelegramParamsFromUrl(): void {
  try {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    const keysToDrop = ['tgWebAppData', 'id', 'hash', 'auth_date', 'first_name', 'last_name', 'username', 'photo_url'];

    let changed = false;

    for (const k of keysToDrop) {
      if (u.searchParams.has(k)) {
        u.searchParams.delete(k);
        changed = true;
      }
    }

    if (u.hash.includes('tgWebAppData=')) {
      const raw = u.hash.startsWith('#') ? u.hash.slice(1) : u.hash;

      if (raw.includes('=') || raw.includes('&')) {
        const params = new URLSearchParams(raw);
        let hashChanged = false;

        for (const k of keysToDrop) {
          if (params.has(k)) {
            params.delete(k);
            hashChanged = true;
          }
        }
        if (hashChanged) {
          const next = params.toString();

          u.hash = next ? `#${next}` : '';
          changed = true;
        }
      }
    }

    if (!changed) return;
    window.history.replaceState({}, '', u.toString());
  } catch {
    /* noop */
  }
}

function formatAuthError(err?: string): string {
  if (err === 'network_error') return 'Ошибка сети';

  return `Ошибка аутентификации: ${err || 'unknown'}`;
}

function isReturnToHostAllowed(hostname: string): boolean {
  const host = (hostname || '').toLowerCase();

  if (!host) return false;
  const allow = Array.isArray(LOGIN_RETURN_TO_HOSTS) ? LOGIN_RETURN_TO_HOSTS : [];

  for (const raw of allow) {
    const rule = String(raw || '')
      .trim()
      .toLowerCase();

    if (!rule) continue;
    if (rule.startsWith('.')) {
      if (host.endsWith(rule)) return true;
      continue;
    }
    if (host === rule) return true;
  }

  return false;
}

function maybeRedirectToReturnTo(): void {
  try {
    if (typeof window === 'undefined') return;
    if (!LOGIN_HOSTNAME) return;
    if (window.location.hostname !== LOGIN_HOSTNAME) return;
    const u = new URL(window.location.href);
    const returnToRaw = (u.searchParams.get('return_to') || '').trim();

    if (!returnToRaw) return;

    let target: URL;

    try {
      target = new URL(returnToRaw);
    } catch {
      return;
    }

    if (target.protocol !== 'https:' && target.protocol !== 'http:') return;
    if (target.username || target.password) return;
    if (!isReturnToHostAllowed(target.hostname)) return;

    window.location.replace(target.toString());
  } catch {
    /* noop */
  }
}

/**
 * Единый клиентский auth-flow для двух режимов:
 * - Telegram Login Widget (обычный сайт): параметры в URL -> BFF -> cookie session
 * - Telegram WebApp: initData -> BFF -> cookie session
 */
export const useAuthFlow = (): UseAuthFlowResult => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [me, setMe] = useState<UserMe | null>(null);
  const [mode, setMode] = useState<AppMode>('unknown');

  const showSiteLogin = useCallback((): void => {
    setMode('site');
    if (authStatus === 'checking') return;
    if (authStatus === 'authenticated') return;
    setAuthStatus('unauthenticated');
  }, [authStatus]);

  const checkSession = useCallback(async (): Promise<boolean> => {
    feLog.info('app.check_session_start');
    const meRes = await getUserMe();

    if (meRes.ok && meRes.data) {
      let data: UserMe = meRes.data;
      const balanceRes = await getUserBalance();

      if (balanceRes.ok && balanceRes.data) {
        data = { ...data, balance: balanceRes.data.balance };
      }
      setMe(data);
      setAuthStatus('authenticated');
      feLog.info('app.session_valid', { user_id: meRes.data.user_id });

      return true;
    }
    setMe(null);
    setAuthStatus('unauthenticated');
    feLog.warn('app.session_invalid', { status: meRes.status, error: meRes.error });

    return false;
  }, []);

  const handleWebAppAuth = useCallback(
    async (initData: string): Promise<void> => {
      setMode('webapp');
      setAuthStatus('checking');
      setErrorMessage('');
      setMe(null);
      const clientProfile = await collectClientProfilePayload(CLIENT_VERSION);
      const authResult = await authenticateTelegramWebApp(initData, clientProfile);

      if (!authResult.ok) {
        setErrorMessage(formatAuthError(authResult.error));
        setAuthStatus('error');

        return;
      }
      await checkSession();
    },
    [checkSession],
  );

  const handleLoginWidgetAuth = useCallback(
    async (widgetData: TelegramLoginWidgetData): Promise<void> => {
      setMode('site');
      setAuthStatus('checking');
      setErrorMessage('');
      setMe(null);
      const clientProfile = await collectClientProfilePayload(CLIENT_VERSION);
      const authResult = await authenticateTelegramLoginWidget(widgetData, clientProfile);

      if (!authResult.ok) {
        setErrorMessage(formatAuthError(authResult.error));
        setAuthStatus('error');

        return;
      }
      const ok = await checkSession();

      if (ok) maybeRedirectToReturnTo();
    },
    [checkSession],
  );

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        setAuthStatus('checking');
        setMode('unknown');
        const widgetData = getTelegramLoginWidgetData();

        if (widgetData) {
          stripTelegramParamsFromUrl();
          await handleLoginWidgetAuth(widgetData);

          return;
        }

        await waitForTelegramWebApp(TELEGRAM_WEBAPP_WAIT_MS);
        const isWebApp = isTelegramWebApp();

        if (isWebApp && typeof window !== 'undefined' && window.Telegram?.WebApp) {
          try {
            window.Telegram.WebApp.ready?.();
          } catch {
            /* empty */
          }
          try {
            window.Telegram.WebApp.expand?.();
          } catch {
            /* empty */
          }
        }

        const initData = await waitForInitData(
          isWebApp ? TELEGRAM_INITDATA_WEBAPP_TIMEOUT_MS : TELEGRAM_INITDATA_SITE_TIMEOUT_MS,
        );
        const hasTgWebAppDataParam =
          typeof window !== 'undefined'
            ? window.location.search.includes('tgWebAppData=') || window.location.hash.includes('tgWebAppData=')
            : false;

        if (initData && (isWebApp || hasTgWebAppDataParam)) {
          if (hasTgWebAppDataParam) stripTelegramParamsFromUrl();
          await handleWebAppAuth(initData);

          return;
        }

        setMode('site');
        await checkSession();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);

        feLog.error('app.init_failed', { error: msg });
        setErrorMessage('Ошибка инициализации');
        setAuthStatus('error');
      }
    };

    void init();
  }, [checkSession, handleLoginWidgetAuth, handleWebAppAuth]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    if (!me?.user_id) return;
    const url = `${BFF}/api/v1/users/balance/stream`;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelayMs = BALANCE_STREAM_RECONNECT_BASE_MS;
    let stopped = false;
    let lastSyncAt = 0;

    const sync = async (reason: string): Promise<void> => {
      const now = Date.now();

      if (now - lastSyncAt < BALANCE_SYNC_THROTTLE_MS) return;
      lastSyncAt = now;
      const balanceRes = await getUserBalance();

      if (balanceRes.ok && balanceRes.data) {
        const balance = balanceRes.data.balance;

        setMe(prev => (prev ? { ...prev, balance } : prev));
      }
      feLog.debug('balance_stream.sync', { reason });
    };

    const onBalance = (ev: MessageEvent): void => {
      try {
        const parsed = JSON.parse(String(ev.data || '{}')) as unknown;
        const payload = parseBalancePayload(parsed);

        if (!payload) return;
        setMe(prev => (prev ? { ...prev, balance: payload.balance } : prev));
      } catch {
        /* noop */
      }
    };

    const onReady = (): void => {
      void sync('ready');
    };

    const onBalanceEvent: EventListener = ev => {
      onBalance(ev as MessageEvent);
    };
    const onReadyEvent: EventListener = () => {
      onReady();
    };

    const cleanupEs = (): void => {
      if (!es) return;
      try {
        es.removeEventListener('balance', onBalanceEvent);
      } catch {
        /* empty */
      }
      try {
        es.removeEventListener('ready', onReadyEvent);
      } catch {
        /* empty */
      }
      try {
        es.close();
      } catch {
        /* empty */
      }
      es = null;
    };

    const scheduleReconnect = (reason: string): void => {
      if (stopped) return;
      if (reconnectTimer) return;
      const delay = reconnectDelayMs;

      reconnectDelayMs = Math.min(
        Math.floor(reconnectDelayMs * BALANCE_STREAM_RECONNECT_EXPONENT),
        BALANCE_STREAM_RECONNECT_MAX_MS,
      );
      feLog.warn('balance_stream.reconnect_scheduled', { reason, delay_ms: delay });
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect('reconnect');
      }, delay);
    };

    const connect = (reason: string): void => {
      cleanupEs();
      if (stopped) return;

      const esInit: EventSourceInit = { withCredentials: true };

      es = new EventSource(url, esInit);
      es.addEventListener('balance', onBalanceEvent);
      es.addEventListener('ready', onReadyEvent);
      es.onopen = () => {
        reconnectDelayMs = BALANCE_STREAM_RECONNECT_BASE_MS;
        feLog.debug('balance_stream.open', { reason });
        void sync('open');
      };
      es.onerror = () => {
        feLog.warn('balance_stream.error');
        void sync('error');
        scheduleReconnect('error');
      };
    };

    connect('init');

    return () => {
      stopped = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      cleanupEs();
    };
  }, [authStatus, me?.user_id]);

  return useMemo(
    () => ({
      authStatus,
      errorMessage,
      me,
      mode,
      showSiteLogin,
    }),
    [authStatus, errorMessage, me, mode, showSiteLogin],
  );
};
