import { type FC } from 'react';

import { Button } from '@shared/ui';

import styles from './CashbackCard.module.scss';

import cashbackCardImage from '@assets/images/CashbackImage.png';

export const CashbackCard: FC = () => {
  return (
    <div className={styles.cashbackCard}>
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>Кэшбек</h3>
          <p className={styles.description}>Введите промокод в поле, чтобы получить бонус</p>
        </div>
        <div className={styles.button}>
          <Button size={'m'}>Забрать 30,74 ₽</Button>
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <img className={styles.image} src={cashbackCardImage} alt="Cashback" />
      </div>
    </div>
  );
};
