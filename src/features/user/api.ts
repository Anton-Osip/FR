import { fetchJSON } from '@/shared/api';
import { BFF, CLIENT_VERSION } from '@/shared/config';
import type { UserBalance, UserMe } from '@/shared/schemas';
export type { UserBalance, UserMe } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry';

/**
 * Возвращает текущего пользователя по cookie-сессии (BFF).
 */
export async function getUserMe(): Promise<{
  ok: boolean;
  data?: UserMe;
  error?: string;
  status: number;
}> {
  try {
    feLog.debug('api.users_me.request');
    const res = await fetchJSON<UserMe>(`${BFF}/api/v1/users/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        accept: 'application/json',
        'x-client-version': CLIENT_VERSION,
      },
    });

    if (!res.ok) {
      feLog.warn('api.users_me.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
      });

      return { ok: false, status: res.status, error: res.data.error || 'unknown_error' };
    }
    feLog.debug('api.users_me.success', { requestId: res.requestId, user_id: res.data?.user_id });

    return { ok: true, status: res.status, data: res.data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('api.users_me.exception', { error: msg });

    return { ok: false, status: 0, error: 'network_error' };
  }
}

/**
 * Возвращает текущий баланс пользователя по cookie-сессии (BFF).
 */
export async function getUserBalance(): Promise<{
  ok: boolean;
  data?: UserBalance;
  error?: string;
  status: number;
}> {
  try {
    feLog.debug('api.users_balance.request');
    const res = await fetchJSON<UserBalance>(`${BFF}/api/v1/users/balance`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        accept: 'application/json',
        'x-client-version': CLIENT_VERSION,
      },
    });

    if (!res.ok) {
      feLog.warn('api.users_balance.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
      });

      return { ok: false, status: res.status, error: res.data.error || 'unknown_error' };
    }
    feLog.debug('api.users_balance.success', {
      requestId: res.requestId,
      balance: res.data?.balance,
    });

    return { ok: true, status: res.status, data: res.data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('api.users_balance.exception', { error: msg });

    return { ok: false, status: 0, error: 'network_error' };
  }
}
