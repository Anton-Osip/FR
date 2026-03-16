import { FC, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { copyToClipboard, formatAmount, formatDateTime, getCurrencySymbol } from '@shared/lib';
import { Button, Modal } from '@shared/ui';
import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider.tsx';
import { ClockIcon, CopyIcon, OkIcon, RejectIcon } from '@shared/ui/icons';

import styles from './OperationDetailsModal.module.scss';

import { mapTransactionStatus, type TransactionStatus } from '@entities/transaction';
import { useGetLinksResolveQuery } from '@features/links';
import type { WalletTransaction } from '@features/wallet';
import type {
  WalletTransactionRequisitesCryptoStatic,
  WalletTransactionRequisitesFiat,
  WalletTransactionRequisitesTelegram,
} from '@features/wallet/model/apiTypes';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

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

  const { data: linksResolve } = useGetLinksResolveQuery({});

  const handleCopy = async (value: string, label: string): Promise<void> => {
    await copyToClipboard(value, `${label} скопирован`, `${label} скопирован в буфер обмена`);
  };

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
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.address')}
              value={cryptoRequisites.address}
              onClickBtn={() => handleCopy(cryptoRequisites.address, t('operationDetails.address'))}
            />
          )}
          {cryptoRequisites.network && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.network')}
              value={cryptoRequisites.network}
              onClickBtn={() => handleCopy(cryptoRequisites.network, t('operationDetails.network'))}
            />
          )}
          {cryptoRequisites.memo && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.memo')}
              value={cryptoRequisites.memo}
              onClickBtn={() => handleCopy(cryptoRequisites.memo!, t('operationDetails.memo'))}
            />
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
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.recipientName')}
              value={fiatRequisites.recipient_name}
              onClickBtn={() => handleCopy(fiatRequisites.recipient_name!, t('operationDetails.recipientName'))}
            />
          )}
          {fiatRequisites.phone && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.phone')}
              value={fiatRequisites.phone}
              onClickBtn={() => handleCopy(fiatRequisites.phone!, t('operationDetails.phone'))}
            />
          )}
          {fiatRequisites.card_number && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.cardNumber')}
              value={fiatRequisites.card_number}
              onClickBtn={() => handleCopy(fiatRequisites.card_number!, t('operationDetails.cardNumber'))}
            />
          )}
          {fiatRequisites.card_holder && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.cardHolder')}
              value={fiatRequisites.card_holder}
              onClickBtn={() => handleCopy(fiatRequisites.card_holder!, t('operationDetails.cardHolder'))}
            />
          )}
          {fiatRequisites.bank_name && (
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.bankName')}
              value={fiatRequisites.bank_name}
              onClickBtn={() => handleCopy(fiatRequisites.bank_name!, t('operationDetails.bankName'))}
            />
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
            <DepositDetailItem
              className={styles.cardInfo}
              btnIcon={<CopyIcon />}
              label={t('operationDetails.botPayUrl')}
              value={telegramRequisites.bot_pay_url}
              onClickBtn={() => handleCopy(telegramRequisites.bot_pay_url!, t('operationDetails.botPayUrl'))}
            />
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
    >
      <div className={styles.container}>
        <header className={styles.header} ref={swipeCloseElementRef}>
          <BannerSlider onClick={() => handleOpenChange(false)} />
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
            {transaction?.uuid && (
              <DepositDetailItem
                className={styles.cardInfo}
                btnIcon={<CopyIcon />}
                label={t('operationDetails.operationId')}
                value={transaction.uuid}
                onClickBtn={() => handleCopy(transaction.uuid!, t('operationDetails.operationId'))}
              />
            )}

            {renderRequisites}
          </div>
          <div className={styles.btnsContainer}>
            <Button
              variant={'primary'}
              fullWidth
              onClick={() => window.open(String(linksResolve?.links.support), '_blank')}
            >
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
