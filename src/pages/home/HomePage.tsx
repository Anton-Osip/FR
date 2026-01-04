import { type FC } from 'react';

import styles from './HomePage.module.scss';

import { BetsSection, HeroSection, MainCarouselSection } from '@/widgets';

export const HomePage: FC = () => {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <MainCarouselSection />
      <BetsSection />
    </div>
  );
};
