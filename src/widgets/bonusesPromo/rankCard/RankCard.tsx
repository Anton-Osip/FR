import { type FC } from 'react';

import * as Progress from '@radix-ui/react-progress';
import { useTranslation } from 'react-i18next';

import { GoldIcon, SilverIcon } from '@shared/ui/icons';

import styles from './RankCard.module.scss';

import silverBg from '@assets/images/silver.png';

const MAX_AMOUNT_IN_K = 100;
const PERCENTAGE_MULTIPLIER = 100;

export const RankCard: FC = () => {
  const { t } = useTranslation('bonuses');
  const amount = '25.1';
  const maxAmountinK = MAX_AMOUNT_IN_K;
  const progressPercent = (parseFloat(amount) / maxAmountinK) * PERCENTAGE_MULTIPLIER;

  return (
    <div className={styles.rankCard}>
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('rankCard.silver')}</h3>
          <p className={styles.description}>{t('rankCard.currentRank')}</p>
        </div>
        <div className={styles.userAmountBlock}>
          <div className={styles.amountWrap}>
            <p>
              {amount}K&nbsp;₽&nbsp;&nbsp;/&nbsp;&nbsp;{maxAmountinK}K&nbsp;₽
            </p>
            <p className={styles.description}>{t('rankCard.turnover')}</p>
          </div>
          <Progress.Root className={styles.progress} value={progressPercent}>
            <Progress.Indicator
              className={styles.progressIndicator}
              style={{ transform: `translateX(-${PERCENTAGE_MULTIPLIER - progressPercent}%)` }}
            />
          </Progress.Root>
          <div className={styles.moneyWrap}>
            <div className={styles.moneyItemWrap}>
              <SilverIcon />
              <p>{t('rankCard.silver')}</p>
            </div>
            <div className={styles.moneyItemWrap}>
              <GoldIcon />
              <p>{t('rankCard.gold')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.image}>
        <img className={styles.userInfoImage} src={silverBg} alt="silver" />
      </div>
    </div>
  );
};
