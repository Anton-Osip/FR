import { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { formatBalance } from '@shared/lib/formatting/formatBalance';
import { Button } from '@shared/ui';
import { WalletIcon } from '@shared/ui/icons';

import styles from './BalanceCard.module.scss';

interface Props {
  balance: string;
}

export const BalanceCard: FC<Props> = ({ balance }) => {
  const { t } = useTranslation('header');
  const balanceNumber = Number(balance);
  const formattedValue = Number.isNaN(balanceNumber) ? 0 : balanceNumber;

  return (
    <div className={styles.balanceCard}>
      <p className={styles.balanceValue}>{formatBalance(formattedValue)} ₽</p>
      <Button
        className={styles.btn}
        icon={
          <div className={styles.btnIcon}>
            <WalletIcon />
          </div>
        }
      >
        <span className={styles.btnText}>{t('topUp')}</span>
      </Button>
    </div>
  );
};
