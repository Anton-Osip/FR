import { FlashIcon } from '@shared/ui/icons/';
import { SevenIcon } from '@shared/ui/icons/';
import { MicrophoneIcon } from '@shared/ui/icons/';
import { FireIcon } from '@shared/ui/icons/';

import { mockData } from '@widgets/Carousel/mockData';

export const carouselData = [
  {
    icon: FireIcon,
    title: 'Популярное',
    items: mockData,
  },
  {
    icon: SevenIcon,
    title: 'Слоты',
    items: mockData,
  },
  {
    icon: MicrophoneIcon,
    title: 'Live-игры',
    items: mockData,
  },
  {
    icon: FlashIcon,
    title: 'Быстрые игры',
    items: mockData,
  },
];
