import { type FC } from 'react';

import { Carousel } from '@widgets/Carousel/ui/Carousel.tsx';

import { carouselData } from './constants';
import styles from './MainCarouselSection.module.scss';

import { CategoryFiltersBar } from '@/widgets';

interface MainCarouselSectionProps {
  className?: string;
}

export const MainCarouselSection: FC<MainCarouselSectionProps> = ({ className }) => {
  return (
    <div className={className}>
      <CategoryFiltersBar className={styles.categoryFiltersBar} />
      <div className={styles.caruseles}>
        {carouselData.map(item => (
          <Carousel key={item.title} icon={item.icon} title={item.title} items={item.items} />
        ))}
      </div>
    </div>
  );
};
