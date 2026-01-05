import { store } from '@app/store/store.ts';

import { getCookie, fetchJSON, baseApi } from '@shared/api';
import { BFF } from '@shared/config';
import { feLog } from '@shared/lib';
import { AuthResult, ClientProfilePayload, TelegramLoginWidgetData } from '@shared/model/types';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${BFF}/ops/healthz`, {
      method: 'GET',
      credentials: 'include',
    }).catch(() => {});
  }

  return getCookie('csrf') || '';
}

interface AuthenticateTelegramWebAppRequest {
  initData: string;
  clientProfile: ClientProfilePayload;
}

interface AuthenticateTelegramLoginWidgetRequest {
  data: TelegramLoginWidgetData;
  clientProfile: ClientProfilePayload;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    authenticateTelegramWebApp: builder.mutation<AuthResult, AuthenticateTelegramWebAppRequest>({
      queryFn: async ({ initData, clientProfile }, _queryApi, _extraOptions, baseQuery) => {
        try {
          feLog.info('auth.telegram_webapp.start', {
            hasInitData: !!initData,
            initDataLength: initData.length,
          });

          const result = await baseQuery({
            url: `${BFF}/api/v1/auth/telegram`,
            method: 'POST',
            body: {
              initData,
              ...clientProfile,
            },
            headers: {
              'content-type': 'application/json',
            },
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('auth.telegram_webapp.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'auth_failed',
              },
            };
          }

          const responseData = result.data as { ok?: boolean } | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('auth.telegram_webapp.success', { requestId, ok: responseData?.ok });

          return { data: { ok: true } };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('auth.telegram_webapp.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      invalidatesTags: ['User'],
    }),

    authenticateTelegramLoginWidget: builder.mutation<AuthResult, AuthenticateTelegramLoginWidgetRequest>({
      queryFn: async ({ data, clientProfile }, _queryApi, _extraOptions, baseQuery) => {
        try {
          const csrf = await ensureCsrf();

          feLog.info('auth.telegram_login_widget.start', { user_id: data.id, username: data.username });

          const result = await baseQuery({
            url: `${BFF}/api/v1/auth/telegram/login-widget`,
            method: 'POST',
            body: {
              ...data,
              ...clientProfile,
            },
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('auth.telegram_login_widget.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
              user_id: data.id,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'auth_failed',
              },
            };
          }

          const responseData = result.data as { ok?: boolean } | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('auth.telegram_login_widget.success', {
            requestId,
            user_id: data.id,
            ok: responseData?.ok,
          });

          return { data: { ok: true } };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('auth.telegram_login_widget.exception', {
            error: msg,
            user_id: data.id,
          });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<boolean, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        try {
          feLog.info('auth.logout.start');
          const csrf = await ensureCsrf();

          const result = await baseQuery({
            url: `${BFF}/api/v1/auth/logout`,
            method: 'POST',
            body: {},
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('auth.logout.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'logout_failed',
              },
            };
          }

          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('auth.logout.success', { requestId });

          return { data: true };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('auth.logout.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      invalidatesTags: ['User', 'Balance'],
    }),
  }),
});

export const { useAuthenticateTelegramWebAppMutation, useAuthenticateTelegramLoginWidgetMutation, useLogoutMutation } =
  authApi;

export async function authenticateTelegramWebApp(
  initData: string,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  const result = await store.dispatch(
    authApi.endpoints.authenticateTelegramWebApp.initiate({ initData, clientProfile }),
  );

  if ('error' in result && result.error) {
    const errorData =
      'data' in result.error && result.error.data ? (result.error.data as { error?: string }) : undefined;

    return { ok: false, error: errorData?.error || 'auth_failed' };
  }

  return { ok: true };
}

export async function authenticateTelegramLoginWidget(
  data: TelegramLoginWidgetData,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  const result = await store.dispatch(
    authApi.endpoints.authenticateTelegramLoginWidget.initiate({ data, clientProfile }),
  );

  if ('error' in result && result.error) {
    const errorData =
      'data' in result.error && result.error.data ? (result.error.data as { error?: string }) : undefined;

    return { ok: false, error: errorData?.error || 'auth_failed' };
  }

  return { ok: true };
}

export async function logout(): Promise<boolean> {
  const result = await store.dispatch(authApi.endpoints.logout.initiate());

  if ('error' in result) {
    return false;
  }

  return result.data ?? false;
}
