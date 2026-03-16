import { FC, ReactNode, useCallback, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { copyToClipboard } from '@shared/lib';
import { Button, Input, Modal, toast } from '@shared/ui';
import { CopyIcon } from '@shared/ui/icons';

import styles from './PromoActivationFinalStepModal.module.scss';

interface PromoActivationFinalStepModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const MODAL_TRANSITION_DELAY = 100;

export const PromoActivationFinalStepModal: FC<PromoActivationFinalStepModalProps> = ({
  trigger,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('bonuses');
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  // const [_, setSecondModalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const swipeCloseElementRef = useRef<HTMLDivElement | null>(null);
  const copyInputRef = useRef<HTMLInputElement | null>(null);

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

  // const handleSecondModalOpenChange = useCallback((newOpen: boolean): void => {
  //   setSecondModalOpen(newOpen);
  // }, []);

  const handleActivateClick = useCallback((): void => {
    // setSecondModalOpen(true);

    setTimeout(() => {
      handleOpenChange(false);
    }, MODAL_TRANSITION_DELAY);
  }, [handleOpenChange]);

  const handleCopy = useCallback(async (): Promise<void> => {
    const valueToCopy = copyInputRef.current?.value;

    if (!valueToCopy) {
      toast.error('Нечего копировать', 'Поле пустое');

      return;
    }

    await copyToClipboard(valueToCopy, 'Скопировано', 'Текст скопирован в буфер обмена');
  }, []);

  return (
    <>
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
            <h3 className={styles.title}>{t('promoActivationFinalStepModal.title')}</h3>
          </header>
          <div className={styles.body}>
            <Input className={styles.input} placeholder={'+ 6 USD'} />

            <ol className={styles.list}>
              <p className={styles.title}>{t('promoActivationFinalStepModal.instructions')}</p>
              <li className={styles.item}>{t('promoActivationFinalStepModal.step1')}</li>
              <li className={styles.item}>
                {t('promoActivationFinalStepModal.step2')}{' '}
                <Link to={'/bonuses'}>{t('promoActivationFinalStepModal.step2Link')}</Link>
              </li>
            </ol>

            <Input
              ref={copyInputRef}
              iconPosition={'end'}
              className={styles.inputCopy}
              icon={<CopyIcon />}
              onIconClick={handleCopy}
            />

            <Button variant={'primary'} size={'m'} fullWidth onClick={handleActivateClick}>
              {t('promoActivationFinalStepModal.depositButton')}
            </Button>
          </div>
        </div>
      </Modal>

      {/*<PromoCodeErrorModal  open={secondModalOpen} onOpenChange={handleSecondModalOpenChange} />*/}
    </>
  );
};
