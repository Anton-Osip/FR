import { subscribeToEvent } from '@shared/lib';

import type { UpdateUserHiddenRequest, UserBalance, UserGeoCountry, UserMe, UserRank } from '../model/types';

import type { BalanceWebSocketEvent } from './userApi.types';

import { baseApi, executeApiRequest, type BaseQueryFn } from '@/shared/api';
import { getBFF, SOCKET_PATHS } from '@/shared/config';

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
            url: `${getBFF()}/api/v1/users/me`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['User'],
    }),

    getUserRank: builder.query<UserRank, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserRank>(
          {
            endpointName: 'users.rank',
            url: `${getBFF()}/api/v1/users/me/rank`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['UserRank'],
    }),

    getUserBalance: builder.query<UserBalance, void>({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserBalance>(
          {
            endpointName: 'users.balance',
            url: `${getBFF()}/api/v1/users/balance`,
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
            const eventType = 'event' in msg ? msg.event : 'type' in msg ? msg.type : undefined;

            if (eventType === 'ready' || eventType === 'ping') {
              return;
            }

            if (eventType === 'balance' && 'data' in msg && msg.data) {
              updateCachedData(() => msg.data as UserBalance);
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
            url: `${getBFF()}/api/v1/users/geo/country`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: GEO_COUNTRY_CACHE_TTL_SECONDS,
      providesTags: ['GeoCountry'],
    }),

    updateUserHidden: builder.mutation<UserMe, UpdateUserHiddenRequest>({
      queryFn: async (arg, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<UserMe>(
          {
            endpointName: 'users.is_hidden',
            url: `${getBFF()}/api/v1/users/is-hidden`,
            method: 'PATCH',
            body: arg,
          },
          baseQuery as BaseQueryFn,
        );
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserMeQuery,
  useGetUserRankQuery,
  useGetUserBalanceQuery,
  useGetUserGeoCountryQuery,
  useUpdateUserHiddenMutation,
} = userApi;

type UseUserGeoCountryResult = ReturnType<typeof useGetUserGeoCountryQuery>;

export const useUserGeoCountry = (): UseUserGeoCountryResult => {
  return useGetUserGeoCountryQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  });
};
