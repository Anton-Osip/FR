import { useState, type FC } from 'react';

import { Button, Input } from '@shared/ui';

import styles from './RewardsCard.module.scss';

interface RewardsCardProps {
  className?: string;
}

export const RewardsCard: FC<RewardsCardProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState<string>('t.me/frosted?start=567558');

  return (
    <div className={`${styles.rewardsCard} ${className ?? ''}`}>
      <div className={styles.info}>
        <h3 className={styles.title}>
          Награды <br /> за приглашения
        </h3>
        <p className={styles.description}>Получайте деньги на баланс за каждого приглашенного друга</p>
      </div>
      <div className={styles.inputWrapper}>
        <Input className={styles.input} value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <Button className={styles.button}>Пригласить</Button>
      </div>
    </div>
  );
};
