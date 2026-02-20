export type GameKind = 'slot' | 'live' | 'fast' | 'blackjack' | 'roulette' | 'baccarat' | 'other';

export interface GameProvider {
  id: number;
  slug: string;
  name: string;
  supports_demo: boolean;
}

export interface Game {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  image: string;
  game_kind: GameKind;
  is_new: boolean;
  is_popular: boolean;
  is_favorite: boolean;
  is_featured: boolean;
  provider: GameProvider;
  blocked_countries: string[];
}
