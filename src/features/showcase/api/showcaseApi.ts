import type {
  BettingTableBetsLatestResponse,
  GetBettingTableBetsLatestParams,
  GetShowcaseGamesParams,
  InitSlotDemoParams,
  InitSlotDemoResponse,
  InitSlotParams,
  InitSlotResponse,
  ShowcaseGamesResponse,
} from '../model/types';

import { buildBettingTableQueryString, buildQueryString } from './showcaseApi.helpers';
import { setupBettingTableWebSocket } from './showcaseApi.socket';

import { baseApi, type BaseQueryFn, executeApiRequest } from '@/shared/api';
import { BFF, SOCKET_PATHS } from '@/shared/config';

const DEFAULT_PAGE_SIZE = 10;

export const showcaseApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getShowcaseGames: builder.query<ShowcaseGamesResponse, GetShowcaseGamesParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = params ? buildQueryString(params) : '';

        return executeApiRequest<ShowcaseGamesResponse>(
          {
            endpointName: 'showcase.games',
            url: `${BFF}/api/v1/showcase/games${queryString}`,
            method: 'GET',
            logData: {
              hasParams: !!params,
              pageSize: params?.page_size,
              searchQuery: params?.search_query,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsLatest: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = params ? buildBettingTableQueryString(params) : '';

        return executeApiRequest<BettingTableBetsLatestResponse>(
          {
            endpointName: 'showcase.betting_table.bets_latest',
            url: `${BFF}/api/v1/showcase/betting_table/bets/latest${queryString}`,
            method: 'GET',
            logData: {
              hasParams: !!params,
              pageSize: params?.page_size,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded;

        const params = _arg || { page_size: DEFAULT_PAGE_SIZE };
        const pageSize = params.page_size || DEFAULT_PAGE_SIZE;

        const unsubscribe = setupBettingTableWebSocket({
          socketPath: SOCKET_PATHS.LATEST,
          pageSize,
          updateCachedData,
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsMy: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = params ? buildBettingTableQueryString(params) : '';

        return executeApiRequest<BettingTableBetsLatestResponse>(
          {
            endpointName: 'showcase.betting_table.bets_my',
            url: `${BFF}/api/v1/showcase/betting_table/bets/my${queryString}`,
            method: 'GET',
            logData: {
              hasParams: !!params,
              pageSize: params?.page_size,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded;

        const params = _arg || { page_size: DEFAULT_PAGE_SIZE };
        const pageSize = params.page_size || DEFAULT_PAGE_SIZE;

        const unsubscribe = setupBettingTableWebSocket({
          socketPath: SOCKET_PATHS.MY,
          pageSize,
          updateCachedData,
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsBigWins: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = params ? buildBettingTableQueryString(params) : '';

        return executeApiRequest<BettingTableBetsLatestResponse>(
          {
            endpointName: 'showcase.betting_table.bets_big_wins',
            url: `${BFF}/api/v1/showcase/betting_table/bets/big-wins${queryString}`,
            method: 'GET',
            logData: {
              hasParams: !!params,
              pageSize: params?.page_size,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        await cacheDataLoaded;

        const params = _arg || { page_size: DEFAULT_PAGE_SIZE };
        const pageSize = params.page_size || DEFAULT_PAGE_SIZE;

        const unsubscribe = setupBettingTableWebSocket({
          socketPath: SOCKET_PATHS.BIG_WINS,
          pageSize,
          updateCachedData,
        });

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ['Showcase'],
    }),

    initSlot: builder.mutation<InitSlotResponse, InitSlotParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<InitSlotResponse>(
          {
            endpointName: 'showcase.slot.init',
            url: `${BFF}/api/v1/showcase/slot/init`,
            method: 'POST',
            body: params,
            logData: { game_uuid: params.game_uuid },
          },
          baseQuery as BaseQueryFn,
        );
      },
    }),

    initSlotDemo: builder.mutation<InitSlotDemoResponse, InitSlotDemoParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<InitSlotDemoResponse>(
          {
            endpointName: 'showcase.slot.init.demo',
            url: `${BFF}/api/v1/showcase/slot/init/demo`,
            method: 'POST',
            body: params,
            logData: { game_uuid: params.game_uuid },
          },
          baseQuery as BaseQueryFn,
        );
      },
    }),
  }),
});

export const {
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
  useGetBettingTableBetsBigWinsQuery,
  useInitSlotMutation,
  useInitSlotDemoMutation,
} = showcaseApi;
