export type SlotsHeaderType =
  | 'allGames'
  | 'popularGames'
  | 'quickGames'
  | 'newGames'
  | 'recommendedGames'
  | 'blackjackGames'
  | 'rouletteGames'
  | 'liveGames'
  | 'baccaratGames';

export interface SlotsHeaderConfig {
  title: string;
}

export const SLOTS_HEADER_MAP: Record<SlotsHeaderType, SlotsHeaderConfig> = {
  allGames: {
    title: 'Слоты',
  },
  popularGames: {
    title: 'Популярное',
  },
  quickGames: {
    title: 'Быстрые игры',
  },
  newGames: {
    title: 'Новинки',
  },
  recommendedGames: {
    title: 'Рекомендованное',
  },
  blackjackGames: {
    title: 'Блэкджек',
  },
  rouletteGames: {
    title: 'Рулетка',
  },
  liveGames: {
    title: 'Live-игры',
  },
  baccaratGames: {
    title: 'Баккара',
  },
};
