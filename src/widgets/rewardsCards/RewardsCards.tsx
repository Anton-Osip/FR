import type { FC } from 'react';

import { AmountCard } from '@widgets/rewardsCards/amountCard';
import { RewardsCard } from '@widgets/rewardsCards/rewardsCard';

import styles from './RewardsCards.module.scss';

interface RewardsCardsProps {
  className?: string;
}

export const RewardsCards: FC<RewardsCardsProps> = ({ className }) => {
  return (
    <div className={`${styles.rewardsCards} ${className ?? ''}`}>
      <RewardsCard />
      <AmountCard description={'Сумма бонусов'} amount={'17 058,94 ₽'} />
      <AmountCard description={'Инвайтов'} amount={'19'} />
    </div>
  );
};
