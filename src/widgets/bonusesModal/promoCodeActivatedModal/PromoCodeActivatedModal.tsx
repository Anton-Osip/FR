import { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Modal } from '@shared/ui';

import {
  BonusActivatedContent,
  FreespinsActivatedContent,
  DepositFixedContent,
  DepositPercentContent,
  DepositFreespinsContent,
} from './components';
import styles from './PromoCodeActivatedModal.module.scss';

import { PromoResponse } from '@features/bonus';

interface PromoCodeActivatedModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  data: PromoResponse;
}

export const PromoCodeActivatedModal: FC<PromoCodeActivatedModalProps> = ({ trigger, open, onOpenChange, data }) => {
  const { t } = useTranslation('promoCodeActivatedModal');
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

  const handleClose = useCallback((): void => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const { title, content } = useMemo(() => {
    switch (data.type) {
      case 'bonus':
        return {
          title: t('bonusActivated'),
          content: <BonusActivatedContent data={data} onClose={handleClose} />,
        };

      case 'freespins':
        return {
          title: t('freespinsActivated'),
          content: <FreespinsActivatedContent data={data} onClose={handleClose} />,
        };

      case 'promo_deposit_fixed':
        return {
          title: t('depositPromoActivated'),
          content: <DepositFixedContent data={data} onClose={handleClose} />,
        };

      case 'promo_deposit_percent':
        return {
          title: t('depositPromoActivated'),
          content: <DepositPercentContent data={data} onClose={handleClose} />,
        };

      case 'promo_deposit_freespins':
        return {
          title: t('depositPromoActivated'),
          content: <DepositFreespinsContent data={data} onClose={handleClose} />,
        };

      default:
        return {
          title: t('promoActivated'),
          content: null,
        };
    }
  }, [data, handleClose, t]);

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
          <h3 className={styles.title}>{title}</h3>
        </header>
        <div className={styles.body}>{content}</div>
      </div>
    </Modal>
  );
};
