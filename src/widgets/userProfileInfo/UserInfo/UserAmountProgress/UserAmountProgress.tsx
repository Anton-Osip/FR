import { type FC } from 'react';

import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { SilverIcon, GoldIcon } from '@shared/ui/icons';

import styles from './UserAmountProgress.module.scss';

interface Props {
  amount: string;
  isProfile?: boolean;
  className?: string;
}

const MAX_AMOUNT_IN_K = 100;
const PERCENTAGE_MULTIPLIER = 100;

export const UserAmountProgress: FC<Props> = ({ amount, isProfile = false, className }) => {
  const { t } = useTranslation('profile');
  const maxAmountinK = MAX_AMOUNT_IN_K;
  const progressPercent = (parseFloat(amount) / maxAmountinK) * PERCENTAGE_MULTIPLIER;

  return (
    <div className={clsx(styles.userAmountBlock, className)}>
      <div className={styles.amountWrap}>
        <p>
          {amount}K&nbsp;₽&nbsp;&nbsp;/&nbsp;&nbsp;{maxAmountinK}K&nbsp;₽
        </p>
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
      <Progress.Root className={styles.progress} value={progressPercent}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${PERCENTAGE_MULTIPLIER - progressPercent}%)` }}
        />
      </Progress.Root>
      <div className={styles.moneyWrap}>
        <div className={styles.moneyItemWrap}>
          <SilverIcon />
          <p>{t('userAmountProgress.silver')}</p>
        </div>
        {!isProfile && (
          <div className={styles.moneyItemWrap}>
            <GoldIcon />
            <p>{t('userAmountProgress.gold')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
