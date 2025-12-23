import { type FC } from 'react';

import { Button } from '@shared/ui';
import { WalletIcon } from '@shared/ui/icons';

import styles from './BalanceCard.module.scss';

interface Props {
  balance: number | null | undefined;
}

const formatBalance = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const BalanceCard: FC<Props> = ({ balance }) => {
  return (
    <div className={styles.balanceCard}>
      <p className={styles.balanceValue}>{formatBalance(balance || 0)} ₽</p>
      <Button
        className={styles.btn}
        icon={
          <div className={styles.btnIcon}>
            <WalletIcon />
          </div>
        }
      >
        <span className={styles.btnText}>Пополнить</span>
      </Button>
    </div>
  );
};
