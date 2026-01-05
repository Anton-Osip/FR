import { feLog } from '../../../shared/lib/telemetry';
import type {
  BettingTableBetsLatestResponse,
  GetBettingTableBetsLatestParams,
  GetShowcaseGamesParams,
  ShowcaseGamesResponse,
} from '../model/types';

import { baseApi } from '@/shared/api';
import { BFF } from '@/shared/config';

function buildQueryString(params: GetShowcaseGamesParams): string {
  const searchParams = new URLSearchParams();

  if (params.page_size !== undefined) {
    searchParams.append('page_size', String(params.page_size));
  }
  if (params.cursor !== undefined && params.cursor !== null) {
    searchParams.append('cursor', params.cursor);
  }
  if (params.search_query !== undefined && params.search_query !== '') {
    searchParams.append('search_query', params.search_query);
  }
  if (params.provider_ids !== undefined && params.provider_ids.length > 0) {
    params.provider_ids.forEach(id => {
      searchParams.append('provider_ids', String(id));
    });
  }
  if (params.game_kinds !== undefined && params.game_kinds !== null && params.game_kinds.length > 0) {
    params.game_kinds.forEach(kind => {
      searchParams.append('game_kinds', kind);
    });
  }
  if (params.only_mobile !== undefined && params.only_mobile !== null) {
    searchParams.append('only_mobile', String(params.only_mobile));
  }
  if (params.only_favorites !== undefined && params.only_favorites !== null) {
    searchParams.append('only_favorites', String(params.only_favorites));
  }
  if (params.only_new !== undefined && params.only_new !== null) {
    searchParams.append('only_new', String(params.only_new));
  }
  if (params.only_popular !== undefined && params.only_popular !== null) {
    searchParams.append('only_popular', String(params.only_popular));
  }
  if (params.only_featured !== undefined && params.only_featured !== null) {
    searchParams.append('only_featured', String(params.only_featured));
  }
  if (params.include_blocked_regions !== undefined) {
    searchParams.append('include_blocked_regions', String(params.include_blocked_regions));
  }
  if (params.sort !== undefined) {
    searchParams.append('sort', params.sort);
  }
  if (params.sort_dir !== undefined) {
    searchParams.append('sort_dir', params.sort_dir);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

function buildBettingTableQueryString(params: GetBettingTableBetsLatestParams): string {
  const searchParams = new URLSearchParams();

  if (params.page_size !== undefined) {
    searchParams.append('page_size', String(params.page_size));
  }
  if (params.cursor !== undefined && params.cursor !== null) {
    searchParams.append('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export const showcaseApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getShowcaseGames: builder.query<ShowcaseGamesResponse, GetShowcaseGamesParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        try {
          const queryString = params ? buildQueryString(params) : '';

          feLog.info('showcase.games.start', {
            hasParams: !!params,
            pageSize: params?.page_size,
            searchQuery: params?.search_query,
          });

          const result = await baseQuery({
            url: `${BFF}/api/v1/showcase/games${queryString}`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('showcase.games.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'showcase_games_failed',
              },
            };
          }

          const responseData = result.data as ShowcaseGamesResponse | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('showcase.games.success', {
            requestId,
            itemsCount: responseData?.items.length,
            hasMore: responseData?.meta.has_more,
          });

          return { data: responseData as ShowcaseGamesResponse };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('showcase.games.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsLatest: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        try {
          const queryString = params ? buildBettingTableQueryString(params) : '';

          feLog.info('showcase.betting_table.bets_latest.start', {
            hasParams: !!params,
            pageSize: params?.page_size,
          });

          const result = await baseQuery({
            url: `${BFF}/api/v1/showcase/betting_table/bets/latest${queryString}`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('showcase.betting_table.bets_latest.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'betting_table_bets_latest_failed',
              },
            };
          }

          const responseData = result.data as BettingTableBetsLatestResponse | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('showcase.betting_table.bets_latest.success', {
            requestId,
            itemsCount: responseData?.items.length,
          });

          return { data: responseData as BettingTableBetsLatestResponse };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('showcase.betting_table.bets_latest.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsMy: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        try {
          const queryString = params ? buildBettingTableQueryString(params) : '';

          feLog.info('showcase.betting_table.bets_my.start', {
            hasParams: !!params,
            pageSize: params?.page_size,
          });

          const result = await baseQuery({
            url: `${BFF}/api/v1/showcase/betting_table/bets/my${queryString}`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('showcase.betting_table.bets_my.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'betting_table_bets_my_failed',
              },
            };
          }

          const responseData = result.data as BettingTableBetsLatestResponse | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('showcase.betting_table.bets_my.success', {
            requestId,
            itemsCount: responseData?.items.length,
          });

          return { data: responseData as BettingTableBetsLatestResponse };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('showcase.betting_table.bets_my.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      providesTags: ['Showcase'],
    }),

    getBettingTableBetsBigWins: builder.query<BettingTableBetsLatestResponse, GetBettingTableBetsLatestParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        try {
          const queryString = params ? buildBettingTableQueryString(params) : '';

          feLog.info('showcase.betting_table.bets_big_wins.start', {
            hasParams: !!params,
            pageSize: params?.page_size,
          });

          const result = await baseQuery({
            url: `${BFF}/api/v1/showcase/betting_table/bets/big-wins${queryString}`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('showcase.betting_table.bets_big_wins.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'betting_table_bets_big_wins_failed',
              },
            };
          }

          const responseData = result.data as BettingTableBetsLatestResponse | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('showcase.betting_table.bets_big_wins.success', {
            requestId,
            itemsCount: responseData?.items.length,
          });

          return { data: responseData as BettingTableBetsLatestResponse };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('showcase.betting_table.bets_big_wins.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
      providesTags: ['Showcase'],
    }),
  }),
});

export const {
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
  useGetBettingTableBetsBigWinsQuery,
} = showcaseApi;
