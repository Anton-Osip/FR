import { type FC } from 'react';

import { Button } from '@shared/ui';
import { WalletIcon } from '@shared/ui/icons';

import styles from './BalanceCard.module.scss';

export const BalanceCard: FC = () => {
  return (
    <div className={styles.balanceCard}>
      <p className={styles.balanceValue}>10 005,84 ₽</p>
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
