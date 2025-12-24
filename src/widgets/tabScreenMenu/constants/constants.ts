import { type FC, type SVGProps } from 'react';

import { TFunction } from 'i18next';

import { SearchSecondaryIcon } from '@shared/ui/icons';
import { TwoUsersIcon } from '@shared/ui/icons';
import { HomeIcon } from '@shared/ui/icons';
import { BonusIcon } from '@shared/ui/icons';
import { BurgerSecondaryIcon } from '@shared/ui/icons';

interface TabMenuDataItem {
  id: string;
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}

export const getTabMenuData = (t: TFunction): TabMenuDataItem[] => [
  {
    id: '1',
    title: t('tabScreenMenu.search'),
    icon: SearchSecondaryIcon,
  },
  {
    id: '2',
    title: t('tabScreenMenu.invite'),
    icon: TwoUsersIcon,
  },
  {
    id: '3',
    title: t('tabScreenMenu.home'),
    icon: HomeIcon,
  },
  {
    id: '4',
    title: t('tabScreenMenu.bonuses'),
    icon: BonusIcon,
  },
  {
    id: '5',
    title: t('tabScreenMenu.menu'),
    icon: BurgerSecondaryIcon,
  },
];
