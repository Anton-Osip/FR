import type { FC, ReactNode } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { BonusIcon, WalletIcon } from '@shared/ui/icons';

import styles from './UserBalance.module.scss';

interface Props {
  isMain: boolean;
  amount?: string;
  isLoading?: boolean;
  className?: string;
}

export const UserBalance: FC<Props> = ({ isMain, amount, isLoading = false, className }) => {
  const { t } = useTranslation('profile');
  const text = isMain ? t('userBalance.mainBalance') : t('userBalance.bonusBalance');
  const buttonText = isMain ? t('userBalance.topUp') : t('userBalance.bonuses');
  const buttonVariant = isMain ? 'primary' : 'tertiary';
  const buttonIcon = isMain ? <WalletIcon /> : <BonusIcon />;
  const balanceTypeClassName = styles[isMain ? 'mainBalance' : 'bonusBalance'];

  const renderAmountContent = (): ReactNode => {
    if (isLoading) {
      return <span className={styles.amountSkeleton} />;
    }

    return amount ?? null;
  };

  return (
    <div className={clsx(styles.balance, balanceTypeClassName, className)}>
      <p className={styles.amount}>{renderAmountContent()}</p>
      <p className={styles.text}>{text}</p>
      <Button className={styles.balanceButton} variant={buttonVariant} icon={buttonIcon}>
        {buttonText}
      </Button>
    </div>
  );
};
