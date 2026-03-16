import { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { formatBalance, getCurrencySymbol } from '@shared/lib';
import { Button } from '@shared/ui';
import { WalletIcon } from '@shared/ui/icons';

import styles from './BalanceCard.module.scss';

import { useGetUserBalanceQuery } from '@entities/user';
import { useWalletModalUrl } from '@features/wallet/model';

export const BalanceCard: FC = () => {
  const { t } = useTranslation('header');
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { openModal: openWalletModal } = useWalletModalUrl();

  const { data: balance } = useGetUserBalanceQuery(undefined, {
    skip: !isLoggedIn,
  });

  const balanceNumber = Number(balance?.balance);
  const formattedValue = Number.isNaN(balanceNumber) ? 0 : balanceNumber;
  const currencySymbol = getCurrencySymbol(balance?.currency);

  return (
    <div className={styles.balanceCard}>
      <p className={styles.balanceValue}>
        {formatBalance(formattedValue)} {currencySymbol}
      </p>
      <Button
        onClick={openWalletModal}
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
