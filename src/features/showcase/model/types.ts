import type { Game, GameKind, GameProvider } from '@/entities/game';

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
  only_history?: boolean | null;
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

export type InitSlotResponse = string;

export interface InitSlotDemoParams {
  game_uuid: string;
}

export type InitSlotDemoResponse = string;

export interface AddFavoriteParams {
  game_uuid: string;
}

export interface AddFavoriteResponse {
  detail: string;
  is_favorite: boolean;
}

export interface RemoveFavoriteParams {
  game_uuid: string;
}

export interface RemoveFavoriteResponse {
  detail: string;
  is_favorite: boolean;
}

export interface GetSlotInfoParams {
  game_uuid: string;
}

export interface GetSlotInfoResponse {
  uuid: string;
  name: string;
  image: string;
  provider: {
    name: string;
    slug: string;
    supports_demo: boolean;
  };
  is_favorite: boolean;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  has_freespins: boolean;
  is_mobile: boolean;
}

export interface GetSlotLeaderboardBigWinsParams {
  game_uuid: string;
  top_n?: number;
}

export interface SlotLeaderboardBigWinItem {
  user_name: string;
  avatar_url: string;
  stake: number;
  payout: number;
  multiplier: number;
  ts: number;
}

export interface GetSlotLeaderboardBigWinsResponse {
  items: SlotLeaderboardBigWinItem[];
  top_n: number;
  game_uuid: string;
}

export interface GetSlotLeaderboardLuckyParams {
  game_uuid: string;
  top_n?: number;
}

export interface SlotLeaderboardLuckyItem {
  user_name: string;
  avatar_url: string;
  stake: number;
  payout: number;
  multiplier: number;
  ts: number;
}

export interface GetSlotLeaderboardLuckyResponse {
  items: SlotLeaderboardLuckyItem[];
  top_n: number;
  game_uuid: string;
}

export interface GetSlotLeaderboardTodayBestParams {
  game_uuid: string;
  top_n?: number;
}

export interface SlotLeaderboardTodayBestItem {
  user_name: string;
  avatar_url: string;
  stake: number;
  payout: number;
  multiplier: number;
  ts: number;
}

export interface GetSlotLeaderboardTodayBestResponse {
  items: SlotLeaderboardTodayBestItem[];
  top_n: number;
  game_uuid: string;
}

export type FeaturedSlotKind = 'weekly' | 'monthly' | 'featured';

export interface GetFeaturedSlotParams {
  kind: FeaturedSlotKind;
}

export interface FeaturedSlotGame {
  uuid: string;
  name: string;
  slug: string;
  game_kind: GameKind;
  is_mobile: boolean;
  has_freespins: boolean;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  provider: GameProvider;
}

export interface GetFeaturedSlotResponse {
  kind: FeaturedSlotKind;
  period_start_ts: number;
  period_end_ts: number;
  image: string;
  desktop: FeaturedSlotGame;
  mobile: FeaturedSlotGame;
}
