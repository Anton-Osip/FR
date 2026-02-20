import { type FC } from 'react';

import bronzeBg from '@shared/assets/icons/bronze-bg.svg?url';
import diamondBg from '@shared/assets/icons/diamond-bg.svg?url';
import goldBg from '@shared/assets/icons/gold-bg.svg?url';
import silverBg from '@shared/assets/icons/silver-bg.svg?url';
import { BrilliantIcon, BronzeIcon, EmptyRankIcon, GoldIcon, SilverIcon } from '@shared/ui/icons';

import { type RankType } from '@entities/user';

export interface RankConfig {
  Icon: FC;
  backgroundImage: string | null;
  labelKey: string;
  bonusesLabelKey: string;
}

export const RANK_CONFIGS: Record<RankType, RankConfig> = {
  bronze: {
    Icon: BronzeIcon,
    backgroundImage: bronzeBg,
    labelKey: 'userAmountProgress.bronze',
    bonusesLabelKey: 'benefitsSection.ranks.bronze',
  },
  silver: {
    Icon: SilverIcon,
    backgroundImage: silverBg,
    labelKey: 'userAmountProgress.silver',
    bonusesLabelKey: 'benefitsSection.ranks.silver',
  },
  gold: {
    Icon: GoldIcon,
    backgroundImage: goldBg,
    labelKey: 'userAmountProgress.gold',
    bonusesLabelKey: 'benefitsSection.ranks.gold',
  },
  diamond: {
    Icon: BrilliantIcon,
    backgroundImage: diamondBg,
    labelKey: 'userAmountProgress.diamond',
    bonusesLabelKey: 'benefitsSection.ranks.diamond',
  },
};

export const DEFAULT_RANK_CONFIG: RankConfig = {
  Icon: EmptyRankIcon,
  backgroundImage: null,
  labelKey: 'userAmountProgress.noRank',
  bonusesLabelKey: 'userAmountProgress.noRank',
};

/**
 * Получить конфигурацию текущего ранга
 */
export const getRankConfig = (rank: RankType | null): RankConfig => {
  return rank ? RANK_CONFIGS[rank] : DEFAULT_RANK_CONFIG;
};

/**
 * Получить конфигурацию следующего ранга
 */
export const getNextRankConfig = (rank: RankType | null): RankConfig | null => {
  switch (rank) {
    case 'bronze':
      return RANK_CONFIGS.silver;
    case 'silver':
      return RANK_CONFIGS.gold;
    case 'gold':
      return RANK_CONFIGS.diamond;
    case 'diamond':
      return null;
    default:
      return RANK_CONFIGS.bronze;
  }
};
