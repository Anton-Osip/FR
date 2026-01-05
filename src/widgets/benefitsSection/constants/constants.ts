import { BgGoldIcon, BgSilverIcon, BrilliantIcon, BronzeIcon, GoldIcon, SilverIcon } from '@shared/ui/icons';

import type { BenefitCard } from '../types/types';

export const getBenefitsData = (t: (key: string) => string): BenefitCard[] => [
  {
    id: '1',
    title: t('benefitsSection.ranks.bronze'),
    description: `${t('benefitsSection.turnover')} 200 000 ₽`,
    icon: BronzeIcon,
    bgIcon: BgSilverIcon,
    cardList: [
      { id: '1', text: t('benefitsSection.benefits.weeklyCashback'), isActive: true },
      { id: '2', text: t('benefitsSection.benefits.monthlyCashback'), isActive: false },
      { id: '3', text: t('benefitsSection.benefits.vipManager'), isActive: false },
    ],
  },
  {
    id: '2',
    title: t('benefitsSection.ranks.silver'),
    description: `${t('benefitsSection.turnover')} 1 000 000 ₽`,
    icon: SilverIcon,
    bgIcon: BgSilverIcon,
    cardList: [
      { id: '1', text: t('benefitsSection.benefits.weeklyCashback'), isActive: true },
      { id: '2', text: t('benefitsSection.benefits.monthlyCashback'), isActive: true },
      { id: '3', text: t('benefitsSection.benefits.vipManager'), isActive: false },
    ],
  },
  {
    id: '3',
    title: t('benefitsSection.ranks.gold'),
    description: `${t('benefitsSection.turnover')} 5 000 000 ₽`,
    icon: GoldIcon,
    bgIcon: BgGoldIcon,
    cardList: [
      { id: '1', text: t('benefitsSection.benefits.weeklyCashback'), isActive: true },
      { id: '2', text: t('benefitsSection.benefits.monthlyCashback'), isActive: true },
      { id: '3', text: t('benefitsSection.benefits.vipManager'), isActive: false },
    ],
  },
  {
    id: '4',
    title: t('benefitsSection.ranks.diamond'),
    description: `${t('benefitsSection.turnover')} 10 000 000 ₽`,
    icon: BrilliantIcon,
    bgIcon: BgGoldIcon,
    cardList: [
      { id: '1', text: t('benefitsSection.benefits.weeklyCashback'), isActive: true },
      { id: '2', text: t('benefitsSection.benefits.monthlyCashback'), isActive: true },
      { id: '3', text: t('benefitsSection.benefits.vipManager'), isActive: true },
    ],
  },
];
