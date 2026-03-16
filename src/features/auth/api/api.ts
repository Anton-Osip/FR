import { baseApi } from '@shared/api/baseApi';
import { getCookie } from '@shared/api/cookies';
import { executeApiRequest, type BaseQueryFn } from '@shared/api/helpers';
import { fetchJSON } from '@shared/api/http';
import { getBFF } from '@shared/config';
import type { AuthResult, ClientProfilePayload, TelegramLoginWidgetData } from '@shared/model';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${getBFF()}/ops/healthz`, {
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
            url: `${getBFF()}/api/v1/auth/telegram`,
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
            url: `${getBFF()}/api/v1/auth/telegram/login-widget`,
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
            url: `${getBFF()}/api/v1/auth/logout`,
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
