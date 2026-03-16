import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@shared/lib';
import { CopyIcon, PersonIcon, WalletIcon } from '@shared/ui/icons';

import styles from './SbpReceiverInfoBlock.module.scss';

import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

export interface SbpReceiverInfoBlockProps {
  card_number?: string;
  bankName?: string;
  card_holder?: string;
  recipient_name?: string;
  phone?: string;
  pay_url?: string;
  portalContainer: HTMLElement | null;
}

export const SbpReceiverInfoBlock: FC<SbpReceiverInfoBlockProps> = ({
  card_number,
  bankName,
  card_holder,
  recipient_name,
  phone,
}) => {
  const { t } = useTranslation('walletModal');

  const handleCopy = async (value: string, labelKey: string): Promise<void> => {
    const label = t(`sbpReceiver.labels.${labelKey}`);

    await copyToClipboard(
      value,
      t('sbpReceiver.copySuccess.title', { label }),
      t('sbpReceiver.copySuccess.description', { label }),
    );
  };

  return (
    <div className={styles.container}>
      {card_number && (
        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpReceiver.labels.transferNumber')}
          value={card_number}
          onClickBtn={() => handleCopy(card_number, 'transferNumber')}
        />
      )}

      {bankName && (
        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpReceiver.labels.bank')}
          value={bankName}
          onClickBtn={() => handleCopy(bankName, 'bank')}
        />
      )}

      {card_holder && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpReceiver.labels.recipient')}
          value={card_holder}
          onClickBtn={() => handleCopy(card_holder, 'recipient')}
        />
      )}

      {recipient_name && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpReceiver.labels.recipient')}
          value={recipient_name}
          onClickBtn={() => handleCopy(recipient_name, 'recipient')}
        />
      )}

      {phone && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpReceiver.labels.phone')}
          value={phone}
          onClickBtn={() => handleCopy(phone, 'phone')}
        />
      )}
    </div>
  );
};
