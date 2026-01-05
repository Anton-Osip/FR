import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import cashbackCardImage from '@shared/assets/images/CashbackImage.png';
import { Button } from '@shared/ui';

import styles from './CashbackCard.module.scss';

interface CashbackCardProps {
  className?: string;
}

export const CashbackCard: FC<CashbackCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const cashbackAmount = '30,74';

  return (
    <div className={clsx(styles.cashbackCard, className ?? className)}>
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('cashbackCard.title')}</h3>
          <p className={styles.description}>{t('cashbackCard.description')}</p>
        </div>
        <div className={styles.button}>
          <Button size={'m'}>
            {t('cashbackCard.claim')} {cashbackAmount} ₽
          </Button>
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={cashbackCardImage} alt="Cashback" />
      </div>
    </div>
  );
};
