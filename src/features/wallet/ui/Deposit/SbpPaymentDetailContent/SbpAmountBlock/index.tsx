import { FC } from 'react';

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
  const formattedAmount = amount ? `${formatAmount(Number(amount.amount))} ${getCurrencySymbol(amount.currency)}` : '0';

  const handleCopyAmount = async (value: string): Promise<void> => {
    await copyToClipboard(
      value,
      'Сумма скопирована',
      'Сумма перевода скопирована в буфер обмена',
      'Не удалось скопировать сумму',
      'Попробуйте еще раз',
    );
  };

  return (
    <div className={styles.container}>
      <DepositDetailItem
        icon={amount?.currency.icon?.url || ''}
        btnIcon={<CopyIcon />}
        label={'Сумма перевода'}
        value={formattedAmount}
        className={styles.depositDetailItem}
        onClickBtn={() => handleCopyAmount(amount?.amount || '0')}
      />
      {amount_changed && (
        <Notice
          title={'Скопируйте сумму'}
          text={'Мы изменили сумму вашего перевода, чтобы убедиться, что это ваш платеж и зачислить его автоматически.'}
        />
      )}
    </div>
  );
};
