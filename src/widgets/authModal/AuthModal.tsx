import { FC, ReactNode, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Modal } from '@shared/ui';
import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider.tsx';
import { ArrowIcon } from '@shared/ui/icons';

import { CheckEmail } from '@widgets/authModal/checkEmail/CheckEmail';
import { LoginModal } from '@widgets/authModal/loginModal/LoginModal';
import { RecoveryPassword } from '@widgets/authModal/recoveryPassword/RecoveryPassword';
import { ShowModal } from '@widgets/authModal/types';

import styles from './AuthModal.module.scss';

interface AuthModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AuthModal: FC<AuthModalProps> = ({ trigger, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<ShowModal>('login');
  const isOpen = open !== undefined ? open : internalOpen;
  const { t } = useTranslation('loginModal');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowModal('login');
    }
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean): void => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const modalTitle = (): ReactNode | string => {
    switch (showModal) {
      case 'login':
        return <BannerSlider onClick={() => handleOpenChange(false)} />;
      case 'recoveryPassword':
        return (
          <header className={styles.header}>
            <Button
              variant="secondary"
              square
              icon={<ArrowIcon className={styles.arrow} />}
              className={styles.backBtn}
              onClick={() => setShowModal('login')}
            />
            <h3 className={styles.title}>{t('recoveryTitle')}</h3>
          </header>
        );
      case 'checkEmail':
        return (
          <header className={styles.header}>
            <Button
              variant="secondary"
              square
              icon={<ArrowIcon className={styles.arrow} />}
              className={styles.backBtn}
              onClick={() => setShowModal('recoveryPassword')}
            />
            <h3 className={styles.title}>{t('checkEmailTitle')}</h3>
          </header>
        );

      default:
        return '...';
    }
  };

  return (
    <Modal
      title={modalTitle()}
      trigger={trigger}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
      headerClassName={styles.modalHeader}
    >
      <div className={styles.body}>
        {showModal === 'login' && <LoginModal onRecoverPassword={() => setShowModal('recoveryPassword')} />}
        {showModal === 'recoveryPassword' && <RecoveryPassword onSuccess={() => setShowModal('checkEmail')} />}
        {showModal === 'checkEmail' && <CheckEmail onClose={() => handleOpenChange(false)} />}
      </div>
    </Modal>
  );
};
