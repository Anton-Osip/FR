import type { Game, GameKind } from '@/entities/game';

export type SortType = 'default' | 'new' | 'popular' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface ShowcaseGamesMeta {
  page_size: number;
  cursor: string;
  next_cursor: string;
  has_more: boolean;
  total: number;
}

export interface ShowcaseGamesResponse {
  meta: ShowcaseGamesMeta;
  items: Game[];
}

export interface GetShowcaseGamesParams {
  page_size?: number;
  cursor?: string | null;
  search_query?: string;
  provider_ids?: number[];
  game_kinds?: GameKind[] | null;
  only_mobile?: boolean | null;
  only_favorites?: boolean | null;
  only_new?: boolean | null;
  only_popular?: boolean | null;
  only_featured?: boolean | null;
  include_blocked_regions?: boolean;
  sort?: SortType;
  sort_dir?: SortDirection;
}

export interface BettingTableBetsMeta {
  page_size: number;
  cursor: string;
  next_cursor: string;
  has_more: boolean;
}

export interface GetBettingTableBetsLatestParams {
  page_size?: number;
  cursor?: string | null;
}

export interface BettingTableBetsLatestResponse {
  meta: BettingTableBetsMeta;
  items: import('@/entities/bet').Bet[];
}

export interface InitSlotParams {
  game_uuid: string;
}

export type InitSlotResponse = any;

export interface InitSlotDemoParams {
  game_uuid: string;
}

export type InitSlotDemoResponse = any;
