import { BgGoldIcon, BgSilverIcon, BrilliantIcon, BronzeIcon, GoldIcon, SilverIcon } from '@shared/ui/icons';

import type { BenefitCard } from '../types/types';

type TranslationOptions = {
  percent?: number;
  [key: string]: unknown;
};

const CASHBACK_PERCENTS = {
  bronze: 10,
  silver: 10,
  gold: 12,
  diamond: 15,
} as const;

const RANK_CONFIG = [
  {
    id: '1',
    rankKey: 'bronze',
    icon: BronzeIcon,
    bgIcon: BgSilverIcon,
    benefits: { weekly: true, monthly: false, vip: false },
  },
  {
    id: '2',
    rankKey: 'silver',
    icon: SilverIcon,
    bgIcon: BgSilverIcon,
    benefits: { weekly: true, monthly: true, vip: false },
  },
  {
    id: '3',
    rankKey: 'gold',
    icon: GoldIcon,
    bgIcon: BgGoldIcon,
    benefits: { weekly: true, monthly: true, vip: true },
  },
  {
    id: '4',
    rankKey: 'diamond',
    icon: BrilliantIcon,
    bgIcon: BgGoldIcon,
    benefits: { weekly: true, monthly: true, vip: true },
  },
] as const;

export const getBenefitsData = (t: (key: string, options?: TranslationOptions) => string): BenefitCard[] =>
  RANK_CONFIG.map(config => {
    const percent = CASHBACK_PERCENTS[config.rankKey];

    return {
      id: config.id,
      title: t(`benefitsSection.ranks.${config.rankKey}`),
      description: t(`benefitsSection.turnover.${config.rankKey}`),
      icon: config.icon,
      bgIcon: config.bgIcon,
      cardList: [
        {
          id: '1',
          text: t('benefitsSection.benefits.weeklyCashback', { percent }),
          isActive: config.benefits.weekly,
        },
        {
          id: '2',
          text: t('benefitsSection.benefits.monthlyCashback', { percent }),
          isActive: config.benefits.monthly,
        },
        {
          id: '3',
          text: t('benefitsSection.benefits.vipManager'),
          isActive: config.benefits.vip,
        },
      ],
    };
  });
