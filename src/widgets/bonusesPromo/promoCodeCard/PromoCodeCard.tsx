import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button, Input } from '@shared/ui';

import styles from './PromoCodeCard.module.scss';

import promoCode from '@assets/images/promoCodeIcon.png';

interface PromoCodeCardProps {
  className?: string;
}

export const PromoCodeCard: FC<PromoCodeCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');

  return (
    <div className={clsx(styles.rankCard, className ?? className)}>
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('promoCodeCard.title')}</h3>
          <p className={styles.description}>{t('promoCodeCard.description')}</p>
        </div>
        <div className={styles.promocode}>
          <Input placeholder={t('promoCodeCard.placeholder')} size={'m'} />
          <Button size={'m'}>{t('promoCodeCard.activate')}</Button>
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={promoCode} alt="promoCode" />
      </div>
    </div>
  );
};
