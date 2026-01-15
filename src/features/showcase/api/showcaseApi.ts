import type {
  AddFavoriteParams,
  AddFavoriteResponse,
  BettingTableBetsLatestResponse,
  GetBettingTableBetsLatestParams,
  GetFeaturedSlotParams,
  GetFeaturedSlotResponse,
  GetShowcaseGamesParams,
  GetSlotInfoParams,
  GetSlotInfoResponse,
  GetSlotLeaderboardBigWinsParams,
  GetSlotLeaderboardBigWinsResponse,
  GetSlotLeaderboardLuckyParams,
  GetSlotLeaderboardLuckyResponse,
  GetSlotLeaderboardTodayBestParams,
  GetSlotLeaderboardTodayBestResponse,
  InitSlotDemoParams,
  InitSlotDemoResponse,
  InitSlotParams,
  InitSlotResponse,
  RemoveFavoriteParams,
  RemoveFavoriteResponse,
  ShowcaseGamesResponse,
} from '../model/types';

import { buildBettingTableQueryString, buildQueryString } from './showcaseApi.helpers';
import { setupBettingTableWebSocket } from './showcaseApi.socket';

import { baseApi, type BaseQueryFn, executeApiRequest, getCookie, fetchJSON } from '@/shared/api';
import { BFF, SOCKET_PATHS } from '@/shared/config';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${BFF}/ops/healthz`, {
      method: 'GET',
      credentials: 'include',
    }).catch(() => {});
  }

  return getCookie('csrf') || '';
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_TOP_N = 3;

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

    getSlotInfo: builder.query<GetSlotInfoResponse, GetSlotInfoParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<GetSlotInfoResponse>(
          {
            endpointName: 'showcase.slot.info',
            url: `${BFF}/api/v1/showcase/slot/info?game_uuid=${params.game_uuid}`,
            method: 'GET',
            logData: { game_uuid: params.game_uuid },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: (_result, _error, arg) => [{ type: 'Showcase', id: `slot-${arg.game_uuid}` }],
    }),

    getSlotLeaderboardBigWins: builder.query<GetSlotLeaderboardBigWinsResponse, GetSlotLeaderboardBigWinsParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const topN = params.top_n ?? DEFAULT_TOP_N;

        return executeApiRequest<GetSlotLeaderboardBigWinsResponse>(
          {
            endpointName: 'showcase.slot.leaderboards.big_wins',
            url: `${BFF}/api/v1/showcase/slot/leaderboards/big-wins?game_uuid=${params.game_uuid}&top_n=${topN}`,
            method: 'GET',
            logData: { game_uuid: params.game_uuid, top_n: topN },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Showcase'],
    }),

    getSlotLeaderboardLucky: builder.query<GetSlotLeaderboardLuckyResponse, GetSlotLeaderboardLuckyParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const topN = params.top_n ?? DEFAULT_TOP_N;

        return executeApiRequest<GetSlotLeaderboardLuckyResponse>(
          {
            endpointName: 'showcase.slot.leaderboards.lucky',
            url: `${BFF}/api/v1/showcase/slot/leaderboards/lucky?game_uuid=${params.game_uuid}&top_n=${topN}`,
            method: 'GET',
            logData: { game_uuid: params.game_uuid, top_n: topN },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Showcase'],
    }),

    getSlotLeaderboardTodayBest: builder.query<GetSlotLeaderboardTodayBestResponse, GetSlotLeaderboardTodayBestParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const topN = params.top_n ?? DEFAULT_TOP_N;

        return executeApiRequest<GetSlotLeaderboardTodayBestResponse>(
          {
            endpointName: 'showcase.slot.leaderboards.today_best',
            url: `${BFF}/api/v1/showcase/slot/leaderboards/today-best?game_uuid=${params.game_uuid}&top_n=${topN}`,
            method: 'GET',
            logData: { game_uuid: params.game_uuid, top_n: topN },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Showcase'],
    }),

    getFeaturedSlot: builder.query<GetFeaturedSlotResponse, GetFeaturedSlotParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<GetFeaturedSlotResponse>(
          {
            endpointName: 'showcase.featured_slot',
            url: `${BFF}/api/v1/showcase/featured-slot/${params.kind}`,
            method: 'GET',
            logData: { kind: params.kind },
          },
          baseQuery as BaseQueryFn,
        );
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

    addFavorite: builder.mutation<AddFavoriteResponse, AddFavoriteParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<AddFavoriteResponse>(
          {
            endpointName: 'showcase.slot.favorites.add',
            url: `${BFF}/api/v1/showcase/slot/favorites`,
            method: 'POST',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            logData: { game_uuid: params.game_uuid },
          },
          baseQuery as BaseQueryFn,
        );
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          showcaseApi.util.updateQueryData('getSlotInfo', { game_uuid: arg.game_uuid }, draft => {
            return { ...draft, is_favorite: true };
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, arg) => ['Showcase', { type: 'Showcase', id: `slot-${arg.game_uuid}` }],
    }),

    removeFavorite: builder.mutation<RemoveFavoriteResponse, RemoveFavoriteParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<RemoveFavoriteResponse>(
          {
            endpointName: 'showcase.slot.favorites.remove',
            url: `${BFF}/api/v1/showcase/slot/favorites`,
            method: 'DELETE',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            logData: { game_uuid: params.game_uuid },
          },
          baseQuery as BaseQueryFn,
        );
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          showcaseApi.util.updateQueryData('getSlotInfo', { game_uuid: arg.game_uuid }, draft => {
            return { ...draft, is_favorite: false };
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, arg) => ['Showcase', { type: 'Showcase', id: `slot-${arg.game_uuid}` }],
    }),
  }),
});

export const {
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
  useGetBettingTableBetsBigWinsQuery,
  useGetSlotInfoQuery,
  useGetSlotLeaderboardBigWinsQuery,
  useGetSlotLeaderboardLuckyQuery,
  useGetSlotLeaderboardTodayBestQuery,
  useGetFeaturedSlotQuery,
  useLazyGetFeaturedSlotQuery,
  useInitSlotMutation,
  useInitSlotDemoMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = showcaseApi;
