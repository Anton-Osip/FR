import { fetchJSON } from '@/shared/api';
import { BFF, CLIENT_VERSION } from '@/shared/config';
import type { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry';

/**
 * Строит query string из параметров запроса.
 */
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
  if (params.game_kinds !== undefined && params.game_kinds.length > 0) {
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

/**
 * Возвращает список игр из витрины по cookie-сессии (BFF).
 */
export async function getShowcaseGames(params?: GetShowcaseGamesParams): Promise<{
  ok: boolean;
  data?: ShowcaseGamesResponse;
  error?: string;
  status: number;
}> {
  try {
    feLog.debug('api.showcase_games.request', { params });
    const queryString = params ? buildQueryString(params) : '';
    const res = await fetchJSON<ShowcaseGamesResponse>(`${BFF}/api/v1/showcase/games${queryString}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        accept: 'application/json',
        'x-client-version': CLIENT_VERSION,
      },
    });

    if (!res.ok) {
      feLog.warn('api.showcase_games.failed', {
        requestId: res.requestId,
        status: res.status,
        error: res.data.error,
      });

      return { ok: false, status: res.status, error: res.data.error || 'unknown_error' };
    }
    feLog.debug('api.showcase_games.success', {
      requestId: res.requestId,
      gamesCount: res.data?.items.length,
      hasMore: res.data?.meta.has_more,
    });

    return { ok: true, status: res.status, data: res.data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error('api.showcase_games.exception', { error: msg });

    return { ok: false, status: 0, error: 'network_error' };
  }
}

/**
 * @deprecated Используйте getShowcaseGames вместо этого.
 * Экспортируется для обратной совместимости.
 */
export const getGames = getShowcaseGames;
