import { type FC } from 'react';

import { HeroSection } from '@widgets/HeroSection';
import { MainCarouselSection } from '@widgets/MainCarouselSection';

import styles from './HomePage.module.scss';

import { BetsSection } from '@/widgets';

export const HomePage: FC = () => {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <MainCarouselSection className={styles['main-carousel-section']} />
      <BetsSection />
    </div>
  );
};
