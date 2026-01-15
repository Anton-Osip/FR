import { subscribeToEvent } from '@shared/lib';

import type { UserBalance, UserGeoCountry, UserMe } from '../model/types';

import type { BalanceWebSocketEvent } from './userApi.types';

import { baseApi, executeApiRequest, type BaseQueryFn } from '@/shared/api';
import { BFF, SOCKET_PATHS } from '@/shared/config';

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const GEO_COUNTRY_CACHE_TTL_SECONDS = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUserMe: builder.query<UserMe, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserMe>(
          {
            endpointName: 'users.me',
            url: `${BFF}/api/v1/users/me`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['User'],
    }),

    getUserBalance: builder.query<UserBalance, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserBalance>(
          {
            endpointName: 'users.balance',
            url: `${BFF}/api/v1/users/balance`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded;

        const unsubscribes = [
          subscribeToEvent<BalanceWebSocketEvent>(SOCKET_PATHS.BALANCE, msg => {
            let newBalance: UserBalance | null = null;

            const eventType = 'event' in msg ? msg.event : 'type' in msg ? msg.type : undefined;

            if (eventType === 'balance' && 'data' in msg) {
              newBalance = msg.data as UserBalance;
            } else if (
              eventType === 'balance' &&
              typeof msg === 'object' &&
              msg !== null &&
              'balance' in msg &&
              'cash' in msg &&
              'bonus' in msg &&
              'revshare' in msg
            ) {
              newBalance = msg as UserBalance;
            } else if (eventType === 'ready' || eventType === 'ping') {
              return;
            } else if (
              !eventType &&
              typeof msg === 'object' &&
              msg !== null &&
              'balance' in msg &&
              'cash' in msg &&
              'bonus' in msg &&
              'revshare' in msg
            ) {
              newBalance = msg as UserBalance;
            }

            if (newBalance) {
              updateCachedData(() => newBalance!);
            }
          }),
        ];

        await cacheEntryRemoved;
        unsubscribes.forEach(unsubscribe => unsubscribe());
      },
      providesTags: ['Balance'],
    }),

    getUserGeoCountry: builder.query<UserGeoCountry, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserGeoCountry>(
          {
            endpointName: 'users.geo.country',
            url: `${BFF}/api/v1/users/geo/country`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: GEO_COUNTRY_CACHE_TTL_SECONDS,
      providesTags: ['GeoCountry'],
    }),
  }),
});

export const { useGetUserMeQuery, useGetUserBalanceQuery, useGetUserGeoCountryQuery } = userApi;

type UseUserGeoCountryResult = ReturnType<typeof useGetUserGeoCountryQuery>;

export const useUserGeoCountry = (): UseUserGeoCountryResult => {
  return useGetUserGeoCountryQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  });
};
