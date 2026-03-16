import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { copyToClipboard, formatAmount, getCurrencySymbol } from '@shared/lib';
import { Notice } from '@shared/ui';
import { CopyIcon } from '@shared/ui/icons';

import styles from './SbpAmountBlock.module.scss';

import { WalletDepositAmount } from '@features/wallet/model/apiTypes.ts';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

export interface SbpAmountBlockProps {
  amount?: WalletDepositAmount;
  amount_changed: boolean;
}

export const SbpAmountBlock: FC<SbpAmountBlockProps> = ({ amount, amount_changed }) => {
  const { t } = useTranslation('walletModal');

  const formattedAmount = amount ? `${formatAmount(Number(amount.amount))} ${getCurrencySymbol(amount.currency)}` : '0';

  const handleCopyAmount = async (value: string): Promise<void> => {
    await copyToClipboard(
      value,
      t('sbpAmount.copySuccess.title'),
      t('sbpAmount.copySuccess.description'),
      t('sbpAmount.copyError.title'),
      t('sbpAmount.copyError.description'),
    );
  };

  return (
    <div className={styles.container}>
      <DepositDetailItem
        icon={amount?.currency.icon?.url || ''}
        btnIcon={<CopyIcon />}
        label={t('sbpAmount.transferAmount')}
        value={formattedAmount}
        className={styles.depositDetailItem}
        onClickBtn={() => handleCopyAmount(amount?.amount || '0')}
      />

      {amount_changed && <Notice title={t('sbpAmount.notice.title')} text={t('sbpAmount.notice.text')} />}
    </div>
  );
};
