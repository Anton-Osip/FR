import type { FC, ReactNode } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/config';
import { Button } from '@shared/ui';
import { BonusIcon, WalletIcon } from '@shared/ui/icons';

import styles from './UserBalance.module.scss';

import { useWalletModalUrl } from '@features/wallet/model';

interface Props {
  isMain: boolean;
  amount?: string;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserBalance: FC<Props> = ({ isMain, amount, isLoading = false, className }) => {
  const { t } = useTranslation('profile');
  const text = isMain ? t('userBalance.mainBalance') : t('userBalance.bonusBalance');
  const buttonText = isMain ? t('userBalance.topUp') : t('userBalance.bonuses');
  const buttonVariant = isMain ? 'primary' : 'tertiary';
  const buttonIcon = isMain ? <WalletIcon /> : <BonusIcon />;
  const balanceTypeClassName = styles[isMain ? 'mainBalance' : 'bonusBalance'];
  const navigate = useNavigate();
  const { openModal: openWalletModal } = useWalletModalUrl();
  const renderAmountContent = (): ReactNode => {
    if (isLoading) {
      return <span className={styles.amountSkeleton} />;
    }

    return amount ?? null;
  };

  return (
    <div className={clsx(styles.balance, balanceTypeClassName, className)}>
      <div className={styles.balancInfo}>
        <p className={styles.amount}>{renderAmountContent()}</p>
        <p className={styles.text}>{text}</p>
      </div>
      {isMain && (
        <Button className={styles.balanceButton} variant={buttonVariant} icon={buttonIcon} onClick={openWalletModal}>
          {buttonText}
        </Button>
      )}
      {!isMain && (
        <Button
          className={styles.balanceButton}
          variant={buttonVariant}
          icon={buttonIcon}
          onClick={() => navigate(APP_PATH.bonuses)}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
