import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { BonusIcon } from '@shared/ui/icons/BonusIcon';
import { WalletIcon } from '@shared/ui/icons/WalletIcon';
import { formatRubles } from '@shared/utils/formatRubles';

import styles from './UserBalance.module.scss';

interface Props {
  isMain: boolean;
  amount: number;
}

export const UserBalance: FC<Props> = ({ isMain, amount }) => {
  const { t } = useTranslation('profile');
  const formattedAmount = formatRubles(amount);
  const text = isMain ? t('userBalance.mainBalance') : t('userBalance.bonusBalance');
  const buttonText = isMain ? t('userBalance.topUp') : t('userBalance.bonuses');
  const buttonVariant = isMain ? 'primary' : 'tertiary';
  const buttonIcon = isMain ? <WalletIcon /> : <BonusIcon />;
  const classNameValue = isMain ? 'mainBalance' : 'bonusBalance';

  return (
    <div className={`${styles.balance} ${classNameValue}`}>
      <p className={styles.amount}>{formattedAmount}</p>
      <p className={styles.text}>{text}</p>
      <Button className={styles.balanceButton} variant={buttonVariant} icon={buttonIcon}>
        {buttonText}
      </Button>
    </div>
  );
};
