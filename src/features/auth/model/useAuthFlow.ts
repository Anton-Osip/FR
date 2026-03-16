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

import { CLIENT_VERSION, getLoginHostname, getLoginReturnHosts } from '@shared/config';
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
 * Быстрая синхронная проверка наличия признаков Telegram контекста.
 * Используется для выбора адаптивных таймаутов: короткие для обычных веб-пользователей,
 * полные для потенциальных Telegram пользователей.
 */
function hasTelegramContextHints(): boolean {
  if (typeof window === 'undefined') return false;

  // Проверяем наличие Telegram WebApp объекта
  if (window.Telegram?.WebApp) return true;

  // Проверяем URL параметры
  const search = window.location.search;
  const hash = window.location.hash;

  // Признаки Telegram WebApp
  if (search.includes('tgWebAppData') || hash.includes('tgWebAppData')) return true;

  // Признаки Telegram Login Widget
  const params = new URLSearchParams(search);

  if (params.has('id') && params.has('hash') && params.has('auth_date')) return true;

  // Проверяем user agent на признаки Telegram WebView (более строгая проверка)
  const userAgent = (window.navigator?.userAgent || '').toLowerCase();

  // Проверяем на специфичные признаки Telegram WebView, но не на просто "WebApp"
  return userAgent.includes('telegram') && (userAgent.includes('webview') || userAgent.includes('webapp'));
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
  const loginReturnToHosts = getLoginReturnHosts();

  if (!host) return false;
  const allow = Array.isArray(loginReturnToHosts) ? loginReturnToHosts : [];

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
    const loginHostname = getLoginHostname();

    if (!loginHostname) return;
    if (window.location.hostname !== loginHostname) return;
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
    if (initRef.current) {
      feLog.debug('app.init_skipped', { reason: 'already_initialized' });

      return;
    }

    const init = async (): Promise<void> => {
      if (initRef.current) {
        feLog.debug('app.init_skipped_async', { reason: 'already_initialized' });

        return;
      }
      initRef.current = true;
      feLog.debug('app.init_start');

      try {
        // Определяем тип устройства при запуске приложения
        const deviceType = detectDeviceType();

        dispatch(setDeviceType({ type: deviceType }));

        const widgetData = getTelegramLoginWidgetData();

        feLog.debug('app.widget_data_check', {
          hasWidgetData: !!widgetData,
          widgetDataKeys: widgetData ? Object.keys(widgetData) : [],
        });

        if (widgetData) {
          feLog.info('app.login_widget_auth_start', { user_id: widgetData.id });
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

        // Быстрая проверка наличия признаков Telegram контекста
        const hasTgHints = hasTelegramContextHints();

        feLog.debug('app.telegram_hints', { hasTelegramContextHints: hasTgHints });

        // Проверяем наличие параметров Telegram в URL (первая загрузка)
        const hasTgWebAppDataParam =
          typeof window !== 'undefined'
            ? window.location.search.includes('tgWebAppData=') || window.location.hash.includes('tgWebAppData=')
            : false;

        // Если есть параметры в URL, это первая загрузка - используем их для авторизации
        if (hasTgWebAppDataParam) {
          // Для Telegram контекста используем полные таймауты
          await waitForTelegramWebApp(TELEGRAM_WEBAPP_WAIT_MS);
          const initData = await waitForInitData(TELEGRAM_INITDATA_WEBAPP_TIMEOUT_MS);

          if (initData) {
            stripTelegramParamsFromUrl();
            await handleWebAppAuth(initData);

            return;
          }
        }

        // Если нет признаков Telegram, сразу проверяем сессию для обычных браузеров
        if (!hasTgHints) {
          dispatch(setMode({ mode: 'site' }));
          await checkSession();

          return;
        }

        // Для Telegram контекста (перезагрузка или без параметров в URL)
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

        // Для Telegram WebApp при перезагрузке сначала проверяем сессию через cookies
        // Это быстрее и надежнее, чем пытаться получить initData
        if (isWebApp) {
          dispatch(setMode({ mode: 'webapp' }));
          const sessionValid = await checkSession();

          // Если сессия валидна, авторизация успешна
          if (sessionValid) {
            return;
          }

          // Если сессия не валидна, пытаемся получить initData для повторной авторизации
          feLog.debug('app.get_init_data_after_session_invalid');
          const initData = await waitForInitData(TELEGRAM_INITDATA_WEBAPP_TIMEOUT_MS);

          if (initData) {
            await handleWebAppAuth(initData);

            return;
          }
        }

        // Если есть признаки Telegram, но не WebApp (например, Login Widget на сайте)
        // Пытаемся получить initData для авторизации
        const initData = await waitForInitData(TELEGRAM_INITDATA_SITE_TIMEOUT_MS);

        if (initData) {
          await handleWebAppAuth(initData);

          return;
        }

        // Если ничего не помогло, проверяем сессию
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
