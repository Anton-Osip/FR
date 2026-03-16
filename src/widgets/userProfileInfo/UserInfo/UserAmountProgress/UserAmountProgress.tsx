import { type FC } from 'react';

import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';

import { PERCENTAGE_MULTIPLIER } from '@shared/config/constants';
import { formatWithSuffix } from '@shared/lib';
import { Button } from '@shared/ui';

import styles from './UserAmountProgress.module.scss';
import { useUserAmountProgress } from './useUserAmountProgress';

interface Props {
  isProfile?: boolean;
  className?: string;
}

export const UserAmountProgress: FC<Props> = ({ isProfile = false, className }) => {
  const {
    t,
    current,
    maxAmount,
    progressPercent,
    currentRank,
    currentRankConfig,
    nextRankConfig,
    isRankLoading,
    currencySymbol,
  } = useUserAmountProgress();
  const { Icon: RankIcon, labelKey: rankLabelKey } = currentRankConfig;
  const shouldShowNextRank = !!nextRankConfig;
  const NextRankIcon = nextRankConfig?.Icon;
  const nextRankLabelKey = nextRankConfig?.labelKey;

  return (
    <div className={clsx(styles.userAmountBlock, className)}>
      <div className={styles.amountWrap}>
        {isRankLoading ? (
          <div className={clsx(styles.skeleton, styles.skeletonAmount)} />
        ) : (
          <p>
            {formatWithSuffix(current)}&nbsp;{currencySymbol}&nbsp;&nbsp;/&nbsp;&nbsp;{formatWithSuffix(maxAmount)}
            &nbsp;{currencySymbol}
          </p>
        )}
        {!isProfile && (
          <Button className={styles.amountButton} variant="ghost">
            {t('userAmountProgress.moreDetails')}
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M1.00001 1L7 6.99995L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        )}
      </div>
      <Progress.Root className={styles.progress} value={progressPercent} aria-label={t('userAmountProgress.progress')}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${PERCENTAGE_MULTIPLIER - progressPercent}%)` }}
        />
      </Progress.Root>
      <div className={styles.moneyWrap}>
        {isRankLoading ? (
          <>
            <div className={clsx(styles.skeleton, styles.skeletonRank)} />
          </>
        ) : (
          <>
            <div className={clsx(styles.moneyItemWrap, currentRank === null && styles.moneyItemWrapEmpty)}>
              <RankIcon />
              <p>{t(rankLabelKey)}</p>
            </div>
            {shouldShowNextRank && NextRankIcon && nextRankLabelKey && (
              <div className={styles.moneyItemWrap}>
                <NextRankIcon />
                <p>{t(nextRankLabelKey)}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
