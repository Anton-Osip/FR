import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  resetError,
  selectAppStatus,
  selectAppSuccess,
  selectErrorMessage,
  selectMe,
  setAppStatus,
  setDeviceType,
  setErrorMessage,
  setMe,
  setMode,
  setShowSiteLogin,
} from '@app/store';

import { CLIENT_VERSION, LOGIN_HOSTNAME, LOGIN_RETURN_TO_HOSTS } from '@shared/config';
import {
  detectDeviceType,
  collectClientProfilePayload,
  getTelegramLoginWidgetData,
  isTelegramWebApp,
  waitForInitData,
  waitForTelegramWebApp,
  feLog,
} from '@shared/lib';
import type { AppMode, AuthStatus, TelegramLoginWidgetData } from '@shared/model';

import { useAuthenticateTelegramLoginWidgetMutation, useAuthenticateTelegramWebAppMutation } from '../api/api';

import type { UserMe } from '@/entities/user';
import { useGetUserMeQuery } from '@/entities/user';

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
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAppStatus);
  const errorMessage = useSelector(selectErrorMessage);
  const me = useSelector(selectMe);
  const mode = useSelector(selectAppSuccess);

  const [authenticateWebApp] = useAuthenticateTelegramWebAppMutation();
  const [authenticateLoginWidget] = useAuthenticateTelegramLoginWidgetMutation();
  const { data: userMe, refetch: refetchUserMe } = useGetUserMeQuery(undefined, {
    skip: false,
  });

  const initRef = useRef(false);

  useEffect(() => {
    if (userMe && authStatus === 'authenticated') {
      const meData: UserMe = {
        ...userMe,
      };

      dispatch(setMe({ me: meData }));
    }
  }, [userMe, authStatus, dispatch]);

  const checkSession = useCallback(async (): Promise<boolean> => {
    feLog.info('app.check_session_start');
    dispatch(setAppStatus({ status: 'checking' }));

    try {
      const meResult = await refetchUserMe();

      if (meResult.data && !meResult.isError) {
        dispatch(setMe({ me: meResult.data }));
        dispatch(setAppStatus({ status: 'authenticated' }));
        feLog.info('app.session_valid', { user_id: meResult.data.user_id });

        return true;
      }
      dispatch(setMe({ me: null }));
      dispatch(setAppStatus({ status: 'unauthenticated' }));
      feLog.warn('app.session_invalid', { error: 'no_data' });

      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      feLog.warn('app.session_invalid', { error: msg });
      dispatch(setMe({ me: null }));
      dispatch(setAppStatus({ status: 'unauthenticated' }));

      return false;
    }
  }, [dispatch, refetchUserMe]);

  const handleWebAppAuth = useCallback(
    async (initData: string): Promise<void> => {
      dispatch(setMode({ mode: 'webapp' }));
      dispatch(setAppStatus({ status: 'checking' }));
      dispatch(resetError());
      dispatch(setMe({ me: null }));

      try {
        const clientProfile = await collectClientProfilePayload(CLIENT_VERSION);
        const authResult = await authenticateWebApp({ initData, clientProfile }).unwrap();

        if (authResult.ok) {
          await checkSession();
        } else {
          dispatch(setErrorMessage({ errorMessage: formatAuthError(authResult.error) }));
          dispatch(setAppStatus({ status: 'error' }));
        }
      } catch (err: unknown) {
        const errorData =
          err && typeof err === 'object' && 'data' in err
            ? (err.data as {
                error?: string;
              })
            : null;
        const error = errorData?.error || 'network_error';

        dispatch(setErrorMessage({ errorMessage: formatAuthError(error) }));
        dispatch(setAppStatus({ status: 'error' }));
      }
    },
    [dispatch, authenticateWebApp, checkSession],
  );

  const handleLoginWidgetAuth = useCallback(
    async (widgetData: TelegramLoginWidgetData): Promise<void> => {
      dispatch(setMode({ mode: 'site' }));
      dispatch(setAppStatus({ status: 'checking' }));
      dispatch(resetError());
      dispatch(setMe({ me: null }));

      try {
        const clientProfile = await collectClientProfilePayload(CLIENT_VERSION);
        const authResult = await authenticateLoginWidget({ data: widgetData, clientProfile }).unwrap();

        if (authResult.ok) {
          const ok = await checkSession();

          if (ok) maybeRedirectToReturnTo();
        } else {
          dispatch(setErrorMessage({ errorMessage: formatAuthError(authResult.error) }));
          dispatch(setAppStatus({ status: 'error' }));
          maybeRedirectToReturnTo();
        }
      } catch (err: unknown) {
        const errorData =
          err && typeof err === 'object' && 'data' in err
            ? (err.data as {
                error?: string;
              })
            : null;
        const error = errorData?.error || 'network_error';

        dispatch(setErrorMessage({ errorMessage: formatAuthError(error) }));
        dispatch(setAppStatus({ status: 'error' }));
        maybeRedirectToReturnTo();
      }
    },
    [dispatch, authenticateLoginWidget, checkSession],
  );

  const showSiteLogin = useCallback(() => {
    dispatch(setShowSiteLogin({ show: true }));
  }, [dispatch]);

  useEffect(() => {
    if (initRef.current) return;

    const init = async (): Promise<void> => {
      if (initRef.current) return;
      initRef.current = true;

      try {
        // Определяем тип устройства при запуске приложения
        const deviceType = detectDeviceType();

        dispatch(setDeviceType({ type: deviceType }));

        const widgetData = getTelegramLoginWidgetData();

        if (widgetData) {
          dispatch(setMode({ mode: 'site' }));
          dispatch(setAppStatus({ status: 'checking' }));
          dispatch(resetError());
          stripTelegramParamsFromUrl();
          await handleLoginWidgetAuth(widgetData);

          return;
        }

        dispatch(setAppStatus({ status: 'checking' }));
        dispatch(setMode({ mode: 'unknown' }));
        dispatch(resetError());

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

        dispatch(setMode({ mode: 'site' }));
        await checkSession();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);

        feLog.error('app.init_failed', { error: msg });
        dispatch(setErrorMessage({ errorMessage: 'Ошибка инициализации' }));
        dispatch(setAppStatus({ status: 'error' }));
        initRef.current = false;
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (authStatus !== 'authenticated') return;
  //   if (!me?.user_id) return;
  //
  //   // Преобразуем HTTP(S) URL в WebSocket URL
  //   const getWebSocketUrl = (): string => {
  //     const httpUrl = `${BFF}/api/v1/users/balance/ws`;
  //
  //     try {
  //       const url = new URL(httpUrl);
  //
  //       url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  //
  //       return url.toString();
  //     } catch {
  //       // Fallback: простая замена протокола
  //       return httpUrl.replace(/^https?:/, httpUrl.startsWith('https') ? 'wss:' : 'ws:');
  //     }
  //   };
  //
  //   const url = getWebSocketUrl();
  //   let ws: WebSocket | null = null;
  //   let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  //   let reconnectDelayMs = BALANCE_STREAM_RECONNECT_BASE_MS;
  //   let stopped = false;
  //   let lastSyncAt = 0;
  //
  //   const sync = async (reason: string): Promise<void> => {
  //     const now = Date.now();
  //
  //     if (now - lastSyncAt < BALANCE_SYNC_THROTTLE_MS) return;
  //     lastSyncAt = now;
  //
  //     try {
  //       const balanceResult = await refetchUserBalance();
  //
  //       if (balanceResult.data) {
  //         const balance = balanceResult.data.balance;
  //
  //         dispatch(setMe({ me: me ? { ...me, balance } : null }));
  //       }
  //     } catch {
  //       /* noop */
  //     }
  //     feLog.debug('balance_stream.sync', { reason });
  //   };
  //
  //   const onBalance = (data: unknown): void => {
  //     try {
  //       const payload = parseBalancePayload(data);
  //
  //       if (!payload) return;
  //       dispatch(setMe({ me: me ? { ...me, balance: String(payload.balance) } : null }));
  //     } catch {
  //       /* noop */
  //     }
  //   };
  //
  //   const onReady = (): void => {
  //     void sync('ready');
  //   };
  //
  //   const handleMessage = (ev: MessageEvent): void => {
  //     try {
  //       const parsed = JSON.parse(String(ev.data || '{}')) as Record<string, unknown>;
  //       const eventType = parsed.type || parsed.event;
  //
  //       if (eventType === 'balance') {
  //         onBalance(parsed.data || parsed);
  //       } else if (eventType === 'ready') {
  //         onReady();
  //       } else if (!eventType) {
  //         // Если тип не указан, пытаемся обработать как баланс напрямую
  //         onBalance(parsed);
  //       }
  //     } catch {
  //       /* noop */
  //     }
  //   };
  //
  //   const cleanupWs = (): void => {
  //     if (!ws) return;
  //     try {
  //       ws.onopen = null;
  //       ws.onmessage = null;
  //       ws.onerror = null;
  //       ws.onclose = null;
  //     } catch {
  //       /* empty */
  //     }
  //     try {
  //       if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
  //         ws.close();
  //       }
  //     } catch {
  //       /* empty */
  //     }
  //     ws = null;
  //   };
  //
  //   const scheduleReconnect = (reason: string): void => {
  //     if (stopped) return;
  //     if (reconnectTimer) return;
  //     const delay = reconnectDelayMs;
  //
  //     reconnectDelayMs = Math.min(
  //       Math.floor(reconnectDelayMs * BALANCE_STREAM_RECONNECT_EXPONENT),
  //       BALANCE_STREAM_RECONNECT_MAX_MS,
  //     );
  //     feLog.warn('balance_stream.reconnect_scheduled', { reason, delay_ms: delay });
  //     reconnectTimer = setTimeout(() => {
  //       reconnectTimer = null;
  //       connect('reconnect');
  //     }, delay);
  //   };
  //
  //   const connect = (reason: string): void => {
  //     cleanupWs();
  //     if (stopped) return;
  //
  //     try {
  //       ws = new WebSocket(url);
  //
  //       ws.onopen = () => {
  //         reconnectDelayMs = BALANCE_STREAM_RECONNECT_BASE_MS;
  //         feLog.debug('balance_stream.open', { reason });
  //         void sync('open');
  //       };
  //
  //       ws.onmessage = handleMessage;
  //
  //       ws.onerror = () => {
  //         feLog.warn('balance_stream.error');
  //         void sync('error');
  //       };
  //
  //       ws.onclose = (ev: CloseEvent) => {
  //         feLog.warn('balance_stream.close', { code: ev.code, reason: ev.reason, wasClean: ev.wasClean });
  //         void sync('close');
  //
  //         // Переподключаемся только если соединение было закрыто неожиданно
  //         if (!ev.wasClean && !stopped) {
  //           scheduleReconnect('close');
  //         }
  //       };
  //     } catch (err: unknown) {
  //       const msg = err instanceof Error ? err.message : String(err);
  //
  //       feLog.error('balance_stream.connect_error', { error: msg });
  //       scheduleReconnect('connect_error');
  //     }
  //   };
  //
  //   connect('init');
  //
  //   return () => {
  //     stopped = true;
  //     if (reconnectTimer) {
  //       clearTimeout(reconnectTimer);
  //       reconnectTimer = null;
  //     }
  //     cleanupWs();
  //   };
  // }, [authStatus, me, dispatch, refetchUserBalance]);

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
