import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { AmountCard } from '@widgets/rewardsCards/amountCard';
import { RewardsCard } from '@widgets/rewardsCards/rewardsCard';

import styles from './RewardsCards.module.scss';

interface RewardsCardsProps {
  className?: string;
}

export const RewardsCards: FC<RewardsCardsProps> = ({ className }) => {
  const { t } = useTranslation('invite');

  return (
    <div className={`${styles.rewardsCards} ${className ?? ''}`}>
      <RewardsCard />
      <AmountCard description={t('rewardsCards.bonusAmount')} amount={'17 058,94 ₽'} />
      <AmountCard description={t('rewardsCards.invitesCount')} amount={'19'} />
    </div>
  );
};
