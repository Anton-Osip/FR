import { BrilliantIcon } from '@shared/ui/icons';
import { GoldIcon } from '@shared/ui/icons';
import { SilverIcon } from '@shared/ui/icons';
import { BronzeIcon } from '@shared/ui/icons';
import { BgGoldIcon } from '@shared/ui/icons';
import { BgSilverIcon } from '@shared/ui/icons';

export const BENEFITS_DATA = [
  {
    id: '1',
    title: 'Бронза',
    description: 'Оборот 200 000 ₽',
    icon: BronzeIcon,
    bgIcon: BgSilverIcon,
    cardList: [
      { id: '1', text: 'Недельный кэшбек 10%', isActive: true },
      { id: '2', text: 'Месячный кэшбек 10%', isActive: false },
      { id: '3', text: 'Личный VIP-менеджер', isActive: false },
    ],
  },
  {
    id: '2',
    title: 'Серебро',
    description: 'Оборот 1 000 000 ₽',
    icon: SilverIcon,
    bgIcon: BgSilverIcon,
    cardList: [
      { id: '1', text: 'Недельный кэшбек 10%', isActive: true },
      { id: '2', text: 'Месячный кэшбек 10%', isActive: true },
      { id: '3', text: 'Личный VIP-менеджер', isActive: false },
    ],
  },
  {
    id: '3',
    title: 'Золото',
    description: 'Оборот 5 000 000 ₽',
    icon: GoldIcon,
    bgIcon: BgGoldIcon,
    cardList: [
      { id: '1', text: 'Недельный кэшбек 10%', isActive: true },
      { id: '2', text: 'Месячный кэшбек 10%', isActive: true },
      { id: '3', text: 'Личный VIP-менеджер', isActive: true },
    ],
  },
  {
    id: '4',
    title: 'Бриллиант',
    description: 'Оборот 10 000 000 ₽',
    icon: BrilliantIcon,
    bgIcon: BgGoldIcon,
    cardList: [
      { id: '1', text: 'Недельный кэшбек 10%', isActive: true },
      { id: '2', text: 'Месячный кэшбек 10%', isActive: true },
      { id: '3', text: 'Личный VIP-менеджер', isActive: true },
    ],
  },
];
