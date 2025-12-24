export type GameKind = 'slot' | 'live' | 'fast' | 'blackjack' | 'roulette' | 'baccarat' | 'other';

export type SortType = 'default' | 'new' | 'popular' | 'name';

export type SortDirection = 'asc' | 'desc';

export interface ShowcaseGameProvider {
  id: number;
  slug: string;
  name: string;
  supports_demo: boolean;
}

export interface ShowcaseGame {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  image: string;
  game_kind: GameKind;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
  provider: ShowcaseGameProvider;
  blocked_countries: string[];
}

export interface ShowcaseGamesMeta {
  page_size: number;
  cursor: string;
  next_cursor: string;
  has_more: boolean;
  total: number;
}

export interface ShowcaseGamesResponse {
  meta: ShowcaseGamesMeta;
  items: ShowcaseGame[];
}

export interface GetShowcaseGamesParams {
  page_size?: number;
  cursor?: string | null;
  search_query?: string;
  provider_ids?: number[];
  game_kinds?: GameKind[];
  only_mobile?: boolean | null;
  only_favorites?: boolean | null;
  only_new?: boolean | null;
  only_popular?: boolean | null;
  only_featured?: boolean | null;
  include_blocked_regions?: boolean;
  sort?: SortType;
  sort_dir?: SortDirection;
}
