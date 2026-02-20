import { FC, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { formatAmount, formatDateTime, getCurrencySymbol } from '@shared/lib';
import { Button, Modal } from '@shared/ui';
import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider.tsx';
import { ClockIcon, OkIcon, RejectIcon } from '@shared/ui/icons';

import styles from './OperationDetailsModal.module.scss';

import { mapTransactionStatus, type TransactionStatus } from '@entities/transaction';
import type { WalletTransaction } from '@features/wallet';
import type {
  WalletTransactionRequisitesCryptoStatic,
  WalletTransactionRequisitesFiat,
  WalletTransactionRequisitesTelegram,
} from '@features/wallet/model/apiTypes';

export interface OperationDetailsModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  transaction?: WalletTransaction | null;
}

export const OperationDetailsModal: FC<OperationDetailsModalProps> = ({ trigger, open, onOpenChange, transaction }) => {
  const { t } = useTranslation('profile');
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const swipeCloseElementRef = useRef<HTMLDivElement | null>(null);
  const handleOpenChange = useCallback(
    (newOpen: boolean): void => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChange],
  );

  const status: TransactionStatus = useMemo(() => {
    return transaction ? mapTransactionStatus(transaction.status) : 'pending';
  }, [transaction]);

  const formattedAmount = useMemo(() => {
    if (!transaction) return '0';

    return `${formatAmount(Number(transaction.amount))} ${getCurrencySymbol(transaction.currency)}`;
  }, [transaction]);

  const formattedDateTime = useMemo(() => {
    if (!transaction) return '';

    return formatDateTime(transaction.created_at);
  }, [transaction]);

  const statusText = useMemo(() => {
    if (!transaction) return '';
    const statusMap: Record<TransactionStatus, string> = {
      resolved: t('operationDetails.statuses.resolved'),
      pending: t('operationDetails.statuses.pending'),
      rejected: t('operationDetails.statuses.rejected'),
    };

    return statusMap[status];
  }, [status, t, transaction]);

  const renderRequisites = useMemo(() => {
    if (!transaction?.requisites) return null;

    const requisites = transaction.requisites;

    // Проверяем тип реквизитов по наличию уникальных полей
    if ('address' in requisites) {
      // WalletTransactionRequisitesCryptoStatic
      const cryptoRequisites = requisites as WalletTransactionRequisitesCryptoStatic;

      return (
        <>
          {cryptoRequisites.address && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.address')}</p>
              <p className={styles.value}>{cryptoRequisites.address}</p>
            </div>
          )}
          {cryptoRequisites.network && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.network')}</p>
              <p className={styles.value}>{cryptoRequisites.network}</p>
            </div>
          )}
          {cryptoRequisites.memo && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.memo')}</p>
              <p className={styles.value}>{cryptoRequisites.memo}</p>
            </div>
          )}
        </>
      );
    }

    if ('card_number' in requisites || 'phone' in requisites || 'recipient_name' in requisites) {
      // WalletTransactionRequisitesFiat
      const fiatRequisites = requisites as WalletTransactionRequisitesFiat;

      return (
        <>
          {fiatRequisites.recipient_name && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.recipientName')}</p>
              <p className={styles.value}>{fiatRequisites.recipient_name}</p>
            </div>
          )}
          {fiatRequisites.phone && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.phone')}</p>
              <p className={styles.value}>{fiatRequisites.phone}</p>
            </div>
          )}
          {fiatRequisites.card_number && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.cardNumber')}</p>
              <p className={styles.value}>{fiatRequisites.card_number}</p>
            </div>
          )}
          {fiatRequisites.card_holder && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.cardHolder')}</p>
              <p className={styles.value}>{fiatRequisites.card_holder}</p>
            </div>
          )}
          {fiatRequisites.bank_name && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.bankName')}</p>
              <p className={styles.value}>{fiatRequisites.bank_name}</p>
            </div>
          )}
        </>
      );
    }

    if ('bot_pay_url' in requisites) {
      // WalletTransactionRequisitesTelegram
      const telegramRequisites = requisites as WalletTransactionRequisitesTelegram;

      return (
        <>
          {telegramRequisites.bot_pay_url && (
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.botPayUrl')}</p>
              <p className={styles.value}>{telegramRequisites.bot_pay_url}</p>
            </div>
          )}
        </>
      );
    }

    return null;
  }, [transaction, t]);

  return (
    <Modal
      trigger={trigger}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
      swipeCloseElementRef={swipeCloseElementRef}
    >
      <div className={styles.container}>
        <header className={styles.header} ref={swipeCloseElementRef}>
          <BannerSlider />
        </header>
        <div className={styles.body}>
          <h3 className={styles.title}>{t('operationDetails.title')}</h3>

          <div className={clsx(styles.amount, styles[status])}>
            <div className={styles.icon}>
              {status === 'resolved' && <OkIcon />}
              {status === 'rejected' && <RejectIcon />}
              {status === 'pending' && <ClockIcon />}
            </div>
            <div className={styles.value}>{formattedAmount}</div>
          </div>

          <div className={styles.transactionInfo}>
            <p className={styles.time}>{formattedDateTime}</p>
            <p className={styles.status}>{statusText}</p>
          </div>
          <div className={styles.cardList}>
            <div className={styles.cardInfo}>
              <p className={styles.title}>{t('operationDetails.operationId')}</p>
              <p className={styles.value}>{transaction?.uuid}</p>
            </div>
            {renderRequisites}
          </div>
          <div className={styles.btnsContainer}>
            <Button variant={'primary'} fullWidth>
              {t('operationDetails.openDispute')}
            </Button>
            <Button variant={'tertiary'} fullWidth onClick={() => handleOpenChange(false)}>
              {t('operationDetails.close')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
