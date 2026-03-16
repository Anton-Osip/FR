import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@shared/lib';
import { Button, FileUploadField, Input } from '@shared/ui';
import { AddFolderIcon, CopyIcon, PersonIcon, WalletIcon } from '@shared/ui/icons';

import styles from './SbpPaymentFormContent.module.scss';

import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

// Временные данные, в реальном приложении будут приходить из пропсов
const TRANSFER_AMOUNT_VALUE = '5053₽';
const NUMBER_FOR_TRANSFER_VALUE = '79288347952';
const BANK_VALUE = 'Т-Банк';
const RECIPIENT_VALUE = 'Альева Ф';

export const SbpPaymentFormContent: FC = () => {
  const { t } = useTranslation('walletModal');

  const handleCopy = async (value: string, labelKey: string): Promise<void> => {
    const label = t(`sbpPaymentForm.labels.${labelKey}`);

    await copyToClipboard(
      value,
      t('sbpPaymentForm.copySuccess.title', { label }),
      t('sbpPaymentForm.copySuccess.description', { label }),
    );
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
          label={t('sbpPaymentForm.labels.transferAmount')}
          value={TRANSFER_AMOUNT_VALUE}
          onClickBtn={() => handleCopy(TRANSFER_AMOUNT_VALUE, 'transferAmount')}
        />

        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpPaymentForm.labels.transferNumber')}
          value={NUMBER_FOR_TRANSFER_VALUE}
          onClickBtn={() => handleCopy(NUMBER_FOR_TRANSFER_VALUE, 'transferNumber')}
        />

        <DepositDetailItem
          icon={<WalletIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpPaymentForm.labels.bank')}
          value={BANK_VALUE}
          onClickBtn={() => handleCopy(BANK_VALUE, 'bank')}
        />

        <DepositDetailItem
          icon={<PersonIcon />}
          btnIcon={<CopyIcon />}
          label={t('sbpPaymentForm.labels.recipient')}
          value={RECIPIENT_VALUE}
          onClickBtn={() => handleCopy(RECIPIENT_VALUE, 'recipient')}
        />
      </div>

      <form className={styles.form}>
        <h3 className={styles.formTitle}>{t('sbpPaymentForm.form.title')}</h3>

        <Input isGhost label={t('sbpPaymentForm.form.fullName')} />

        <FileUploadField
          id="payment-check"
          icon={<AddFolderIcon />}
          placeholder={t('sbpPaymentForm.form.receiptPlaceholder')}
          accept=".png,.jpg,.jpeg"
          className={styles.fileUploadField}
        />

        <label htmlFor="payment-check" className={styles.label}>
          {t('sbpPaymentForm.form.receiptLabel')}
        </label>

        <Button fullWidth disabled>
          {t('sbpPaymentForm.form.submitButton')}
        </Button>
      </form>
    </div>
  );
};
