import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { formatRubles } from '@shared/lib';
import { Button } from '@shared/ui';
import { BonusIcon, WalletIcon } from '@shared/ui/icons';

import styles from './UserBalance.module.scss';

interface Props {
  isMain: boolean;
  amount: number;
  className?: string;
}

export const UserBalance: FC<Props> = ({ isMain, amount, className }) => {
  const { t } = useTranslation('profile');
  const formattedAmount = formatRubles(amount);
  const text = isMain ? t('userBalance.mainBalance') : t('userBalance.bonusBalance');
  const buttonText = isMain ? t('userBalance.topUp') : t('userBalance.bonuses');
  const buttonVariant = isMain ? 'primary' : 'tertiary';
  const buttonIcon = isMain ? <WalletIcon /> : <BonusIcon />;
  const classNameValue = isMain ? 'mainBalance' : 'bonusBalance';

  return (
    <div className={clsx(styles.balance, classNameValue, className)}>
      <p className={styles.amount}>{formattedAmount}</p>
      <p className={styles.text}>{text}</p>
      <Button className={styles.balanceButton} variant={buttonVariant} icon={buttonIcon}>
        {buttonText}
      </Button>
    </div>
  );
};
