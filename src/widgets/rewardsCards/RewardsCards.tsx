import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { formatBalance } from '@shared/lib';

import { AmountCard } from './amountCard';
import { RewardsCard } from './rewardsCard';
import styles from './RewardsCards.module.scss';

import { useGetInviteOverviewQuery } from '@/features/invite';

interface RewardsCardsProps {
  className?: string;
}

export const RewardsCards: FC<RewardsCardsProps> = ({ className }) => {
  const { t } = useTranslation('invite');

  const { data } = useGetInviteOverviewQuery();

  const bonus_sum = formatBalance(data?.bonus_sum ?? 0);
  const invited_count = data?.invited_count ?? 0;
  const invited_count_formatted = formatBalance(invited_count);

  return (
    <div className={clsx(styles.rewardsCards, className ?? '')}>
      <RewardsCard />
      <AmountCard description={t('rewardsCards.bonusAmount')} amount={`${bonus_sum} ₽`} />
      <AmountCard
        description={t('rewardsCards.invitesCount', { count: invited_count })}
        amount={invited_count_formatted}
      />
    </div>
  );
};
