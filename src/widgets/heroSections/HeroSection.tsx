import { type FC } from 'react';

import clsx from 'clsx';

import { HeroBonus } from './HeroBonus';
import { HeroCashback } from './HeroCashback';
import styles from './HeroSection.module.scss';
import { HeroSlot } from './HeroSlot';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={clsx(styles.hero, className ?? className)}>
      <HeroBonus />
      <HeroSlot />
      <HeroCashback />
    </div>
  );
};
