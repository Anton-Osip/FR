import { store } from '@app/store';

import { getCookie, fetchJSON, baseApi, executeApiRequest, type BaseQueryFn } from '@shared/api';
import { BFF } from '@shared/config';
import { AuthResult, ClientProfilePayload, TelegramLoginWidgetData } from '@shared/model';

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
        const result = await executeApiRequest<{ ok?: boolean }>(
          {
            endpointName: 'auth.telegram_webapp',
            url: `${BFF}/api/v1/auth/telegram`,
            method: 'POST',
            body: {
              initData,
              ...clientProfile,
            },
            headers: {
              'content-type': 'application/json',
            },
            logData: {
              hasInitData: !!initData,
              initDataLength: initData.length,
            },
          },
          baseQuery as BaseQueryFn,
        );

        if ('error' in result) {
          return result;
        }

        return { data: { ok: true } };
      },
      invalidatesTags: ['User'],
    }),

    authenticateTelegramLoginWidget: builder.mutation<AuthResult, AuthenticateTelegramLoginWidgetRequest>({
      queryFn: async ({ data, clientProfile }, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        const result = await executeApiRequest<{ ok?: boolean }>(
          {
            endpointName: 'auth.telegram_login_widget',
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
            logData: {
              user_id: data.id,
              username: data.username,
            },
          },
          baseQuery as BaseQueryFn,
        );

        if ('error' in result) {
          return result;
        }

        return { data: { ok: true } };
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<boolean, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        const result = await executeApiRequest<unknown>(
          {
            endpointName: 'auth.logout',
            url: `${BFF}/api/v1/auth/logout`,
            method: 'POST',
            body: {},
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
          },
          baseQuery as BaseQueryFn,
        );

        if ('error' in result) {
          return result;
        }

        return { data: true };
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
