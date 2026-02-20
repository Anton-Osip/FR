import { FC } from 'react';

import { copyToClipboard } from '@shared/lib';
import { CopyIcon, PersonIcon, WalletIcon } from '@shared/ui/icons';

import styles from './SbpReceiverInfoBlock.module.scss';

import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

const NUMBER_FOR_TRANSFER_LABEL = 'Номер для перевода';
const BANK_LABEL = 'Банк';
const RECIPIENT_LABEL = 'Получатель';
const PHONE_LABEL = 'Номер телефона';

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
  const handleCopy = async (value: string, label: string): Promise<void> => {
    await copyToClipboard(value, `${label} скопирован`, `${label} скопирован в буфер обмена`);
  };

  return (
    <div className={styles.container}>
      {card_number && (
        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={NUMBER_FOR_TRANSFER_LABEL}
          value={card_number}
          onClickBtn={() => handleCopy(card_number, NUMBER_FOR_TRANSFER_LABEL)}
        />
      )}
      {bankName && (
        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={BANK_LABEL}
          value={bankName}
          onClickBtn={() => handleCopy(bankName, BANK_LABEL)}
        />
      )}

      {card_holder && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={RECIPIENT_LABEL}
          value={card_holder}
          onClickBtn={() => handleCopy(card_holder, RECIPIENT_LABEL)}
        />
      )}

      {recipient_name && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={RECIPIENT_LABEL}
          value={recipient_name}
          onClickBtn={() => handleCopy(recipient_name, RECIPIENT_LABEL)}
        />
      )}
      {phone && (
        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={PHONE_LABEL}
          value={phone}
          onClickBtn={() => handleCopy(phone, PHONE_LABEL)}
        />
      )}
    </div>
  );
};
