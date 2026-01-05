import { type FC } from 'react';

import { useTranslation } from 'react-i18next';

// import { selectIsLoggedIn } from '@app/store';
//
// import { useAppSelector } from '@shared/api';
import { formatBalance } from '@shared/lib';
import { Button } from '@shared/ui';
import { WalletIcon } from '@shared/ui/icons';

import styles from './BalanceCard.module.scss';

// import { useGetUserBalanceQuery } from '@entities/user';

export const BalanceCard: FC = () => {
  const { t } = useTranslation('header');
  // const isLoggedIn = useAppSelector(selectIsLoggedIn);
  // const { data: balance } = useGetUserBalanceQuery(null, {
  //   skip: !isLoggedIn,
  // });
  const balanceNumber = Number(0);
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
