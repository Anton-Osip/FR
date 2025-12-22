import { type FC } from 'react';

import styles from '../HeroSection.module.scss';

import { HeroBonus } from './HeroBonus';
import { HeroCashback } from './HeroCashback';
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
