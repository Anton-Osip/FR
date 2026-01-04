import { type FC } from 'react';

import { HeroBonus } from './HeroBonus';
import { HeroCashback } from './HeroCashback';
import styles from './HeroSection.module.scss';
import { HeroSlot } from './HeroSlot';

export const HeroSection: FC = () => {
  return (
    <div className={styles.hero}>
      <HeroBonus />
      <HeroSlot />
      <HeroCashback />
    </div>
  );
};
