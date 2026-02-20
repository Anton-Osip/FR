import { FC } from 'react';

import { copyToClipboard } from '@shared/lib';
import { Button, FileUploadField, Input } from '@shared/ui';
import { AddFolderIcon, CopyIcon, PersonIcon, WalletIcon } from '@shared/ui/icons';

import styles from './SbpPaymentFormContent.module.scss';

import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

const TRANSFER_AMOUNT_LABEL = 'Сумма перевода';
const TRANSFER_AMOUNT_VALUE = '5053₽';
const NUMBER_FOR_TRANSFER_LABEL = 'Номер для перевода';
const NUMBER_FOR_TRANSFER_VALUE = '79288347952';
const BANK_LABEL = 'Банк';
const BANK_VALUE = 'Т-Банк';
const RECIPIENT_LABEL = 'Получатель';
const RECIPIENT_VALUE = 'Альева Ф';

export const SbpPaymentFormContent: FC = () => {
  const handleCopy = async (value: string, label: string): Promise<void> => {
    await copyToClipboard(value, `${label} скопирован`, `${label} скопирован в буфер обмена`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoWrapper}>
        <DepositDetailItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="12" fill="#1873F2" />
              <path
                d="M10.5191 13.2483V14.269H13.6955V15.3724H10.5191V17H8.70191V15.3724H7.5V14.269H8.70191V13.2483H7.5V11.8H8.70191V7H12.0215C14.6542 7 16.5 7.63448 16.5 10.1172C16.5 12.4897 14.6542 13.2483 12.0215 13.2483H10.5191ZM10.5191 11.8H12.093C13.4952 11.8 14.6256 11.5241 14.6256 10.1172C14.6256 8.72414 13.4952 8.46207 12.093 8.46207H10.5191V11.8Z"
                fill="#F0F5FF"
              />
            </svg>
          }
          btnIcon={<CopyIcon />}
          label={TRANSFER_AMOUNT_LABEL}
          value={TRANSFER_AMOUNT_VALUE}
          onClickBtn={() => handleCopy(TRANSFER_AMOUNT_VALUE, TRANSFER_AMOUNT_LABEL)}
        />
        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={NUMBER_FOR_TRANSFER_LABEL}
          value={NUMBER_FOR_TRANSFER_VALUE}
          onClickBtn={() => handleCopy(NUMBER_FOR_TRANSFER_VALUE, NUMBER_FOR_TRANSFER_LABEL)}
        />

        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={BANK_LABEL}
          value={BANK_VALUE}
          onClickBtn={() => handleCopy(BANK_VALUE, BANK_LABEL)}
        />

        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={RECIPIENT_LABEL}
          value={RECIPIENT_VALUE}
          onClickBtn={() => handleCopy(RECIPIENT_VALUE, RECIPIENT_LABEL)}
        />
      </div>

      <form className={styles.form}>
        <h3 className={styles.formTitle}>Укажите данные</h3>

        <Input isGhost label={'ФИО'} />

        <FileUploadField
          id="payment-check"
          icon={<AddFolderIcon />}
          placeholder="Чек операции"
          accept=".png,.jpg,.jpeg"
          className={styles.fileUploadField}
        />

        <label htmlFor="payment-check" className={styles.label}>
          Чек по операции с номером документа (PNG, JPG)
        </label>

        <Button fullWidth disabled>
          Отправить
        </Button>
      </form>
    </div>
  );
};
