import { type FC, useMemo } from 'react';

import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { PERCENTAGE_MULTIPLIER } from '@shared/config/constants';
import { formatWithSuffix } from '@shared/lib';

import { useUserAmountProgress } from '@widgets/userProfileInfo/UserInfo/UserAmountProgress/useUserAmountProgress';

import styles from './RankCard.module.scss';

interface RankCardProps {
  className?: string;
}

export const RankCard: FC<RankCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const { t: tProfile } = useTranslation('profile');

  const {
    current,
    maxAmount,
    progressPercent,
    currentRank,
    currentRankConfig,
    nextRankConfig,
    isRankLoading,
    currencySymbol,
  } = useUserAmountProgress();

  // Мемоизация вычислений
  const rankTitle = useMemo(
    () => (currentRank ? t(currentRankConfig.bonusesLabelKey) : tProfile(currentRankConfig.labelKey)),
    [currentRank, currentRankConfig.bonusesLabelKey, currentRankConfig.labelKey, t, tProfile],
  );

  const backgroundImage = useMemo(() => currentRankConfig.backgroundImage, [currentRankConfig.backgroundImage]);

  const CurrentRankIcon = currentRankConfig.Icon;
  const NextRankIcon = nextRankConfig?.Icon;

  const isLoading = isRankLoading;

  return (
    <div className={clsx(styles.rankCard, className)}>
      <div className={clsx(styles.info, !currentRank && styles.fullWidth)}>
        <div className={styles.titleWrapper}>
          {isLoading ? (
            <div className={styles.skeletonTitle} aria-busy="true" aria-label={t('rankCard.loading')} />
          ) : (
            <>
              <h3 className={styles.title}>{rankTitle}</h3>
              <p className={styles.description}>{t('rankCard.currentRank')}</p>
            </>
          )}
        </div>
        <div className={styles.userAmountBlock}>
          <div className={styles.amountWrap}>
            {isLoading ? (
              <div className={styles.skeletonAmount} aria-busy="true" aria-label={t('rankCard.loading')} />
            ) : (
              <p>
                {formatWithSuffix(current)}&nbsp;{currencySymbol}&nbsp;&nbsp;/&nbsp;&nbsp;{formatWithSuffix(maxAmount)}
                &nbsp;{currencySymbol}
              </p>
            )}
            <p className={styles.description}>{t('rankCard.turnover')}</p>
          </div>
          <Progress.Root className={styles.progress} value={progressPercent} aria-label={t('rankCard.progress')}>
            <Progress.Indicator
              className={styles.progressIndicator}
              style={{ transform: `translateX(-${PERCENTAGE_MULTIPLIER - progressPercent}%)` }}
            />
          </Progress.Root>
          <div className={styles.moneyWrap}>
            {isLoading ? (
              <div className={styles.skeletonRanks} aria-busy="true" aria-label={t('rankCard.loading')} />
            ) : (
              <>
                <div className={styles.moneyItemWrap}>
                  <CurrentRankIcon aria-hidden="true" />
                  <p>{tProfile(currentRankConfig.labelKey)}</p>
                </div>
                {nextRankConfig && NextRankIcon && (
                  <div className={styles.moneyItemWrap}>
                    <NextRankIcon aria-hidden="true" />
                    <p>{tProfile(nextRankConfig.labelKey)}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {backgroundImage && (
        <div className={styles.image}>
          <img className={styles.userInfoImage} src={backgroundImage} alt="" aria-hidden="true" role="presentation" />
        </div>
      )}
    </div>
  );
};
