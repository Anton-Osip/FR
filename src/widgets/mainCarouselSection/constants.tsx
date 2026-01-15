import { type FC, type SVGProps } from 'react';

import { ClockIcon, FireIcon, FlashIcon, MicrophoneIcon, SevenIcon, WindowIcon } from '@shared/ui/icons/';
import type { Tab } from '@shared/ui/tabs/Tabs';

interface CarouselDataItem {
  icon: FC<SVGProps<SVGSVGElement>>;
  title: string;
  id: 'popular' | 'slot' | 'live' | 'fast' | 'history';
}

export const getCarouselData = (t: (key: string) => string): CarouselDataItem[] => [
  {
    icon: ClockIcon,
    title: t('carousel.history'),
    id: 'history',
  },
  {
    icon: FireIcon,
    title: t('carousel.popular'),
    id: 'popular',
  },
  {
    icon: SevenIcon,
    title: t('carousel.slots'),
    id: 'slot',
  },
  {
    icon: MicrophoneIcon,
    title: t('carousel.liveGames'),
    id: 'live',
  },
  {
    icon: FlashIcon,
    title: t('carousel.quickGames'),
    id: 'fast',
  },
];

export const getCategoryTabs = (t: (key: string) => string, activeTab: string): Tab[] => [
  {
    id: '1',
    value: 'all',
    label: t('categoryFiltersBar.allGames'),
    icon: <WindowIcon />,
    active: activeTab === 'all',
  },
  {
    id: '2',
    value: 'popular',
    label: t('categoryFiltersBar.popular'),
    icon: <FireIcon />,
    active: activeTab === 'popular',
  },
  {
    id: '3',
    value: 'slots',
    label: t('categoryFiltersBar.slots'),
    icon: <SevenIcon />,
    active: activeTab === 'slot',
  },
  {
    id: '4',
    value: 'liveGames',
    label: t('categoryFiltersBar.liveGames'),
    icon: <MicrophoneIcon />,
    active: activeTab === 'live',
  },
  {
    id: '5',
    value: 'flashGames',
    label: t('categoryFiltersBar.quickGames'),
    icon: <FlashIcon />,
    active: activeTab === 'fast',
  },
];
