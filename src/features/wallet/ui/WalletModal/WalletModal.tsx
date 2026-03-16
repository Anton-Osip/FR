import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '@shared/ui';

import { WalletModalContent } from '../components/WalletModalContent';
import { WalletModalHeader } from '../components/WalletModalHeader';
import { BankPaymentContent } from '../Deposit/BankPaymentContent';

import styles from './WalletModal.module.scss';

import {
  WALLET_MODAL,
  WalletModalProps,
  resetModal,
  selectContentKey,
  selectSelectedWithdrawMethod,
  selectShowModal,
  setShowModal,
} from '@features/wallet/model';
import { CryptocurrencyPaymentContent } from '@features/wallet/ui/Deposit/CryptocurrencyPaymentContent';
import { TelegramcurrencyPaymentContent } from '@features/wallet/ui/Deposit/CryptocurrencyPaymentContent/TelegramcurrencyPaymentContent.tsx';
import { SbpPaymentDetailContent, SbpPaymentFormContent } from '@features/wallet/ui/Deposit/SbpPaymentDetailContent';
import { ConclusionContent } from '@features/wallet/ui/Withdrawal/ConclusionContent';
import { WithdrawalByCardContent } from '@features/wallet/ui/Withdrawal/WithdrawalByCardContent';
import { WithdrawalByCryptocurrencyContent } from '@features/wallet/ui/Withdrawal/WithdrawalByCryptocurrencyContent';
import { WithdrawalByTelegramcurrencyContent } from '@features/wallet/ui/Withdrawal/WithdrawalByCryptocurrencyContent/WithdrawalByTelegramcurrencyContent.tsx';

export const WalletModal: FC<WalletModalProps> = ({ trigger, open, onOpenChange }) => {
  const { t } = useTranslation('walletModal');
  const selectedMethod = useSelector(selectSelectedWithdrawMethod);
  const dispatch = useDispatch();
  const showModal = useSelector(selectShowModal);
  const contentKey = useSelector(selectContentKey);
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean): void => {
      if (newOpen && !isOpen) {
        dispatch(resetModal());
      }
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isOpen, onOpenChange, dispatch],
  );

  useEffect(() => {
    if (!isOpen && showModal !== WALLET_MODAL.WALLET) {
      dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }));
    }
  }, [isOpen, showModal, dispatch]);

  const modalTitle = (): ReactNode | string => {
    switch (showModal) {
      case WALLET_MODAL.WALLET:
        return t('title');
      case WALLET_MODAL.BANK_PAYMENT:
        return (
          <WalletModalHeader
            title={t('modalTitles.bankPayment')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      case WALLET_MODAL.WITHDRAWAL_BY_CARD:
        return (
          <WalletModalHeader
            title={t('modalTitles.withdrawalByCard')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      case WALLET_MODAL.CONCLUSION:
        return (
          <WalletModalHeader
            title={t('modalTitles.withdrawal')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      case WALLET_MODAL.CRYPTOCURRENCY_PAYMENT_CONTENT:
      case WALLET_MODAL.TELEGRAMCURRENCY_PAYMENT_CONTENT:
        return (
          <WalletModalHeader
            title={t('modalTitles.cryptoPayment')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      case WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT:
        return (
          <WalletModalHeader
            title={selectedMethod?.title || t('modalTitles.sbp')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      case WALLET_MODAL.SBP_PAYMENT_FORM_CONTENT:
        return (
          <WalletModalHeader
            title={t('modalTitles.sbp')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT }))}
          />
        );
      case WALLET_MODAL.WITHDRAWAL_BY_TELEGRAM_CURRENCY:
      case WALLET_MODAL.WITHDRAWAL_BY_CRYPTOCURRENCY:
        return (
          <WalletModalHeader
            title={t('modalTitles.cryptoWithdrawal')}
            onBack={() => dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }))}
          />
        );
      default:
        return t('title');
    }
  };

  return (
    <Modal
      ref={setPortalContainer}
      trigger={trigger}
      open={isOpen}
      title={modalTitle()}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      bodyClassName={styles.body}
      closeButtonClassName={clsx(showModal !== WALLET_MODAL.WALLET && styles.closeButton)}
    >
      <div key={showModal} className={styles.contentWrapper}>
        {showModal === WALLET_MODAL.WALLET && <WalletModalContent key={contentKey} isOpen={isOpen} />}
        {showModal === WALLET_MODAL.BANK_PAYMENT && selectedMethod && (
          <BankPaymentContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.WITHDRAWAL_BY_CARD && selectedMethod && (
          <WithdrawalByCardContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.CONCLUSION && selectedMethod && (
          <ConclusionContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.WITHDRAWAL_BY_CRYPTOCURRENCY && selectedMethod && (
          <WithdrawalByCryptocurrencyContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.WITHDRAWAL_BY_TELEGRAM_CURRENCY && selectedMethod && (
          <WithdrawalByTelegramcurrencyContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.CRYPTOCURRENCY_PAYMENT_CONTENT && selectedMethod && (
          <CryptocurrencyPaymentContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.TELEGRAMCURRENCY_PAYMENT_CONTENT && selectedMethod && (
          <TelegramcurrencyPaymentContent selectedMethod={selectedMethod} />
        )}
        {showModal === WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT && selectedMethod && (
          <SbpPaymentDetailContent
            portalContainer={portalContainer}
            selectedMethod={selectedMethod}
            onClose={() => handleOpenChange(false)}
          />
        )}
        {showModal === WALLET_MODAL.SBP_PAYMENT_FORM_CONTENT && <SbpPaymentFormContent />}
      </div>
    </Modal>
  );
};
