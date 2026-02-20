import { type FC } from 'react';

import { BetsSection } from '@widgets/betsSection';
import { HeroSection } from '@widgets/heroSections';
import { MainCarouselSection } from '@widgets/mainCarouselSection';

import styles from './HomePage.module.scss';

export const HomePage: FC = () => {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <MainCarouselSection />
      <BetsSection />
    </div>
  );
};
