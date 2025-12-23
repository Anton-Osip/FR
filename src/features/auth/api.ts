import axios from 'axios';

import { getCookie } from '@/shared/api/http';
import { BFF, CLIENT_VERSION } from '@/shared/config/constants';
import type { ClientProfilePayload } from '@/shared/schemas';
import type { AuthResult, TelegramLoginWidgetData } from '@/shared/schemas';
export type { AuthResult, TelegramLoginWidgetData } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry/feLogger';

const HTTP_SUCCESS_MIN = 200;
const HTTP_SUCCESS_MAX = 299;

const isHttpSuccess = (status: number): boolean => status >= HTTP_SUCCESS_MIN && status <= HTTP_SUCCESS_MAX;

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await axios
      .get(`${BFF}/ops/healthz`, {
        withCredentials: true,
        validateStatus: () => true,
      })
      .catch(() => {});
  }

  return getCookie('csrf') || '';
}

export async function authenticateTelegramWebApp(
  initData: string,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  try {
    feLog.info('auth.telegram_webapp.start', {
      hasInitData: !!initData,
      initDataLength: initData.length,
    });
    const res = await axios.post(
      `${BFF}/api/v1/auth/telegram`,
      {
        initData,
        ...clientProfile,
      },
      {
        withCredentials: true,
        headers: {
          'content-type': 'application/json',
          'x-client-version': CLIENT_VERSION,
        },
        validateStatus: () => true,
      },
    );
    const requestId = res.headers['x-request-id'];
    const ok = isHttpSuccess(res.status);

    if (!ok) {
      feLog.warn('auth.telegram_webapp.failed', {
        requestId,
        status: res.status,
        error: res.data?.error,
      });

      return { ok: false, error: res.data?.error || 'auth_failed' };
    }
    feLog.info('auth.telegram_webapp.success', { requestId, ok: res.data?.ok });

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('auth.telegram_webapp.exception', { error: msg });

    return { ok: false, error: 'network_error' };
  }
}

/**
 * Аутентификация через Telegram Login Widget (сайт): подписанные поля из URL -> BFF.
 */
export async function authenticateTelegramLoginWidget(
  data: TelegramLoginWidgetData,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  try {
    const csrf = await ensureCsrf();

    feLog.info('auth.telegram_login_widget.start', { user_id: data.id, username: data.username });
    const res = await axios.post(
      `${BFF}/api/v1/auth/telegram/login-widget`,
      { ...data, ...clientProfile },
      {
        withCredentials: true,
        headers: {
          'content-type': 'application/json',
          'x-client-version': CLIENT_VERSION,
          'x-csrf-token': csrf,
        },
        validateStatus: () => true,
      },
    );
    const requestId = res.headers['x-request-id'];
    const ok = isHttpSuccess(res.status);

    if (!ok) {
      feLog.warn('auth.telegram_login_widget.failed', {
        requestId,
        status: res.status,
        error: res.data?.error,
        user_id: data.id,
      });

      return { ok: false, error: res.data?.error || 'auth_failed' };
    }
    feLog.info('auth.telegram_login_widget.success', {
      requestId,
      user_id: data.id,
      ok: res.data?.ok,
    });

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('auth.telegram_login_widget.exception', {
      error: msg,
      user_id: data.id,
    });

    return { ok: false, error: 'network_error' };
  }
}

/**
 * Завершение текущей сессии в BFF (cookie-based).
 */
export async function logout(): Promise<boolean> {
  try {
    feLog.info('auth.logout.start');
    const csrf = await ensureCsrf();
    const res = await axios.post(
      `${BFF}/api/v1/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'content-type': 'application/json',
          'x-client-version': CLIENT_VERSION,
          'x-csrf-token': csrf,
        },
        validateStatus: () => true,
      },
    );
    const requestId = res.headers['x-request-id'];
    const ok = isHttpSuccess(res.status);

    if (!ok) {
      feLog.warn('auth.logout.failed', {
        requestId,
        status: res.status,
        error: res.data?.error,
      });

      return false;
    }
    feLog.info('auth.logout.success', { requestId });

    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('auth.logout.exception', { error: msg });

    return false;
  }
}
