import { FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { copyToClipboard, formatAmount, getCurrencySymbol } from '@shared/lib';
import { Button, Modal, Notice, toast } from '@shared/ui';
import { CopyIcon, ShieldCheckIcon } from '@shared/ui/icons';

import { SbpAmountBlock } from './SbpAmountBlock';
// import { SbpConditionsBlock } from './SbpConditionsBlock';
import styles from './SbpPaymentDetailContent.module.scss';
import { SbpReceiverInfoBlock } from './SbpReceiverInfoBlock';
import { SbpTimerBlock } from './SbpTimerBlock';

import { useGetWalletDepositActiveQuery, useLazyGetWalletTransactionByUuidQuery } from '@features/wallet/api/walletApi';
import { WithdrawMethod } from '@features/wallet/model';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

interface SbpPaymentDetailContentProps {
  portalContainer: HTMLElement | null;
  selectedMethod: WithdrawMethod;
  onClose?: () => void;
}

const SECOND_PEER_MINUTES = 60;
const INTERVAL_DELAY = 1000;
const TIMER_DELAY = 15;
const MAX_LENGTH = 2;

export const SbpPaymentDetailContent: FC<SbpPaymentDetailContentProps> = ({
  portalContainer,
  selectedMethod,
  onClose,
}) => {
  const { t } = useTranslation('walletModal');
  const [wasModalDismissed, setWasModalDismissed] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(TIMER_DELAY);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  const { data } = useGetWalletDepositActiveQuery({
    method: selectedMethod.code,
  });

  const [getTransactionByUuid, { isLoading: isCheckingPayment }] = useLazyGetWalletTransactionByUuidQuery();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimerSeconds(TIMER_DELAY);
    setIsTimerActive(true);

    const timer = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);

          return 0;
        }

        return prev - 1;
      });
    }, INTERVAL_DELAY);

    return () => clearInterval(timer);
  }, []);

  const infoModal = data?.amount_changed === true && !wasModalDismissed;

  const formattedAmount = data?.account
    ? `${formatAmount(Number(data.account.amount))} ${getCurrencySymbol(data.account.currency)}`
    : '0';

  const formatTimer = (seconds: number): string => {
    const remainingSeconds = Math.max(0, seconds);
    // Вычисляем минуты и секунды
    const mins = Math.floor(remainingSeconds / SECOND_PEER_MINUTES);
    const secs = remainingSeconds % SECOND_PEER_MINUTES;

    return `${mins.toString().padStart(MAX_LENGTH, '0')}:${secs.toString().padStart(MAX_LENGTH, '0')}`;
  };

  const isButtonDisabled = isTimerActive || isCheckingPayment || !data?.uuid;

  const handleCopyAmount = async (value: string): Promise<void> => {
    await copyToClipboard(
      value,
      t('sbpPaymentDetail.copySuccess.title'),
      t('sbpPaymentDetail.copySuccess.description'),
      t('sbpPaymentDetail.copyError.title'),
      t('sbpPaymentDetail.copyError.description'),
    );
  };

  const handlePaymentConfirm = async (): Promise<void> => {
    if (!data?.uuid) {
      return;
    }

    try {
      const result = await getTransactionByUuid({ uuid: data.uuid }).unwrap();

      switch (result.status) {
        case 'success':
          toast.success(
            t('sbpPaymentDetail.paymentStatus.success.title'),
            t('sbpPaymentDetail.paymentStatus.success.description'),
          );
          onClose?.();
          break;
        case 'pending':
          toast.info(
            t('sbpPaymentDetail.paymentStatus.pending.title'),
            t('sbpPaymentDetail.paymentStatus.pending.description'),
          );
          break;
        case 'rejected':
          toast.error(
            t('sbpPaymentDetail.paymentStatus.rejected.title'),
            t('sbpPaymentDetail.paymentStatus.rejected.description'),
          );
          break;
        default:
          toast.info(
            t('sbpPaymentDetail.paymentStatus.default.title'),
            t('sbpPaymentDetail.paymentStatus.default.description'),
          );
      }
    } catch {
      toast.error(
        t('sbpPaymentDetail.paymentStatus.checkError.title'),
        t('sbpPaymentDetail.paymentStatus.checkError.description'),
      );
    }
  };

  const pay_url = data?.requisites.pay_url;

  return (
    <div className={styles.container}>
      <SbpAmountBlock amount={data?.account} amount_changed={data?.amount_changed || false} />

      <SbpReceiverInfoBlock
        pay_url={pay_url}
        card_number={data?.requisites.card_number}
        bankName={data?.requisites.bank_name}
        card_holder={data?.requisites.card_holder}
        phone={data?.requisites.phone}
        recipient_name={data?.requisites.recipient_name}
        portalContainer={portalContainer}
      />

      <SbpTimerBlock expiresAt={data?.requisites.expires_at} />

      <Notice icon={<ShieldCheckIcon />} text={t('sbpPaymentDetail.guaranteeText')} />

      {/*<SbpConditionsBlock />*/}

      {pay_url && (
        <Button
          fullWidth
          onClick={() => window.open(pay_url, '_blank')}
          disabled={isCheckingPayment || !data?.uuid}
          icon={isCheckingPayment ? <div className={styles.spinner} /> : undefined}
        >
          {t('sbpPaymentDetail.goToPayment')}
        </Button>
      )}

      <Button
        variant={pay_url ? 'tertiary' : 'primary'}
        fullWidth
        onClick={handlePaymentConfirm}
        disabled={isButtonDisabled}
        icon={isCheckingPayment ? <div className={styles.spinner} /> : undefined}
      >
        <span className={styles.btnText}>
          {isTimerActive
            ? t('sbpPaymentDetail.paidButton.withTimer', { time: formatTimer(timerSeconds) })
            : t('sbpPaymentDetail.paidButton.withoutTimer')}
        </span>
      </Button>

      <Modal
        overlayClassName={styles.overlay}
        open={infoModal}
        onOpenChange={open => {
          if (!open) {
            setWasModalDismissed(true);
          }
        }}
        portalContainer={portalContainer}
        contentClassName={styles.modalContent}
        showCloseButton={false}
      >
        <div className={styles.modalBody}>
          <DepositDetailItem
            icon={data?.account?.currency?.icon?.url || ''}
            btnIcon={<CopyIcon />}
            label={t('sbpPaymentDetail.modal.transferAmount')}
            value={formattedAmount}
            className={styles.depositDetailItem}
            onClickBtn={() => handleCopyAmount(data?.account?.amount || '')}
          />

          <Notice title={t('sbpPaymentDetail.modal.notice.title')} text={t('sbpPaymentDetail.modal.notice.text')} />

          <Button onClick={() => setWasModalDismissed(true)}>{t('sbpPaymentDetail.modal.gotIt')}</Button>
        </div>
      </Modal>
    </div>
  );
};
