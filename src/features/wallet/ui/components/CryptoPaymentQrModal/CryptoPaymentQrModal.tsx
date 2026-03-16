import { type Dispatch, type FC, type SetStateAction, useRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, toast, VisuallyHidden } from '@shared/ui';

import styles from './CryptoPaymentQrModal.module.scss';

import { WalletModalHeader } from '@features/wallet/ui/components/WalletModalHeader';

interface CryptoPaymentQrModalProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  portalContainer: Element | DocumentFragment | null;
  headerTitle: string;
  address: string;
}

const QR_CODE_SIZE = 188;
const QR_CODE_BG_COLOR = '#000000';
const QR_CODE_FG_COLOR = '#FFFFFF';
const QR_CODE_ERROR_LEVEL = 'Q';
const ADDRESS_PREFIX_LENGTH = 10;

export const CryptoPaymentQrModal: FC<CryptoPaymentQrModalProps> = ({
  open,
  onOpenChange,
  portalContainer,
  headerTitle,
  address,
}) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('walletModal');
  const handleBack = (): void => {
    onOpenChange(false);
  };

  const handleSaveQr = (): void => {
    const qrContainer = qrCodeRef.current;

    if (!qrContainer) return;

    const canvas = qrContainer.querySelector<HTMLCanvasElement>('canvas');

    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      link.download = `qr-code-${address.slice(0, ADDRESS_PREFIX_LENGTH)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('cryptoQrModal.saveSuccess.title'), t('cryptoQrModal.saveSuccess.description'));
    } catch (error) {
      console.error('Failed to save QR code:', error);
      toast.error(t('cryptoQrModal.saveError.title'), t('cryptoQrModal.saveError.description'));
    }
  };

  if (!address || address.trim().length === 0) {
    toast.error(t('cryptoQrModal.addressError.title'), t('cryptoQrModal.addressError.description'));
    onOpenChange(false);

    return null;
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton
      overlayClassName={styles.overlay}
      contentClassName={styles.content}
      bodyClassName={styles.body}
      closeButtonClassName={styles.closeButton}
      headerClassName={styles.headerClassName}
      portalContainer={portalContainer}
      title={<WalletModalHeader title={headerTitle} onBack={handleBack} />}
    >
      <VisuallyHidden>
        <Dialog.Title>{headerTitle}</Dialog.Title>
      </VisuallyHidden>
      <div className={styles.container}>
        <div ref={qrCodeRef} className={styles.wrapper} aria-label={t('cryptoQrModal.qrCodeLabel', { address })}>
          <QRCodeCanvas
            value={address}
            size={QR_CODE_SIZE}
            bgColor={QR_CODE_BG_COLOR}
            fgColor={QR_CODE_FG_COLOR}
            level={QR_CODE_ERROR_LEVEL}
          />
        </div>
        <Button onClick={handleSaveQr}> {t('cryptoQrModal.saveButton')}</Button>
      </div>
    </Modal>
  );
};
