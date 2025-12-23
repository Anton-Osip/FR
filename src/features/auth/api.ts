import { fetchJSON, getCookie } from '@/shared/api/http';
import { BFF, CLIENT_VERSION } from '@/shared/config/constants';
import type { ClientProfilePayload } from '@/shared/schemas';
import type { AuthResult, TelegramLoginWidgetData } from '@/shared/schemas';
export type { AuthResult, TelegramLoginWidgetData } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry/feLogger';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetch(`${BFF}/ops/healthz`, { method: 'GET', credentials: 'include' }).catch(() => {});
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
    const res = await fetchJSON<{ ok: boolean }>(`${BFF}/api/v1/auth/telegram`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-client-version': CLIENT_VERSION,
      },
      body: JSON.stringify({
        initData,
        ...clientProfile,
      }),
    });

    if (!res.ok) {
      feLog.warn('auth.telegram_webapp.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
      });

      return { ok: false, error: res.data.error || 'auth_failed' };
    }
    feLog.info('auth.telegram_webapp.success', { requestId: res.requestId, ok: res.data?.ok });

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
    const res = await fetchJSON<{ ok: boolean }>(`${BFF}/api/v1/auth/telegram/login-widget`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-client-version': CLIENT_VERSION,
        'x-csrf-token': csrf,
      },
      body: JSON.stringify({ ...data, ...clientProfile }),
    });

    if (!res.ok) {
      feLog.warn('auth.telegram_login_widget.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
        user_id: data.id,
      });

      return { ok: false, error: res.data.error || 'auth_failed' };
    }
    feLog.info('auth.telegram_login_widget.success', {
      requestId: res.requestId,
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
    const res = await fetchJSON<{ ok: boolean }>(`${BFF}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-client-version': CLIENT_VERSION,
        'x-csrf-token': csrf,
      },
    });

    if (!res.ok) {
      feLog.warn('auth.logout.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
      });

      return false;
    }
    feLog.info('auth.logout.success');

    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('auth.logout.exception', { error: msg });

    return false;
  }
}
