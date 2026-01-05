import type { UserBalance, UserMe } from '../model/types';

import type { BalanceWebSocketEvent } from './userApi.types';

import { baseApi } from '@/shared/api';
import { BFF, SOCKET_PATHS } from '@/shared/config';
import { subscribeToEvent } from '@/shared/lib/socket';

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUserMe: builder.query<UserMe, void>({
      query: () => ({
        url: `${BFF}/api/v1/users/me`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    getUserBalance: builder.query<UserBalance, void>({
      query: () => ({
        url: `${BFF}/api/v1/users/balance`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // очистка сразу после размонтирования
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        // Ждем разрешения начального запроса перед продолжением
        await cacheDataLoaded;

        const unsubscribes = [
          subscribeToEvent<BalanceWebSocketEvent>(SOCKET_PATHS.BALANCE, msg => {
            let newBalance: UserBalance | null = null;

            // Обработка разных форматов сообщений
            if ('type' in msg && msg.type === 'balance' && 'data' in msg) {
              newBalance = msg.data as UserBalance;
            } else if (
              typeof msg === 'object' &&
              msg !== null &&
              'balance' in msg &&
              'cash' in msg &&
              'bonus' in msg &&
              'revshare' in msg
            ) {
              newBalance = msg as UserBalance;
            } else if ('type' in msg && (msg.type === 'ready' || msg.type === 'ping')) {
              // События ready и ping обрабатываются, но не обновляют баланс
              return;
            }

            if (newBalance) {
              updateCachedData(() => newBalance!);
            }
          }),
        ];

        // CacheEntryRemoved разрешится, когда подписка на кеш больше не активна
        await cacheEntryRemoved;
        unsubscribes.forEach(unsubscribe => unsubscribe());
      },
      providesTags: ['Balance'],
    }),
  }),
});

export const { useGetUserMeQuery, useGetUserBalanceQuery } = userApi;
