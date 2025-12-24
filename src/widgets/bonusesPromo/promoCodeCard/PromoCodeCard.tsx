import { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from '@shared/ui';

import styles from './PromoCodeCard.module.scss';

import promoCode from '@assets/images/promoCodeIcon.png';

export const PromoCodeCard: FC = () => {
  const { t } = useTranslation('bonuses');

  return (
    <div className={styles.rankCard}>
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
