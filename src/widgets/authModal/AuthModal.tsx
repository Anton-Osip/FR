import { FC, ReactNode, useEffect, useRef, useState } from 'react';

import { Modal } from '@shared/ui';

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
  const swipeCloseElementRef = useRef<HTMLDivElement | null>(null);

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
      <div className={styles.body}>
        {showModal === 'login' && (
          <LoginModal
            swipeCloseElementRef={swipeCloseElementRef}
            onRecoverPassword={() => setShowModal('recoveryPassword')}
          />
        )}
        {showModal === 'recoveryPassword' && (
          <RecoveryPassword
            swipeCloseElementRef={swipeCloseElementRef}
            onBackToLogin={() => setShowModal('login')}
            onSuccess={() => setShowModal('checkEmail')}
          />
        )}
        {showModal === 'checkEmail' && (
          <CheckEmail
            swipeCloseElementRef={swipeCloseElementRef}
            onBackToRecovery={() => setShowModal('recoveryPassword')}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </div>
    </Modal>
  );
};
