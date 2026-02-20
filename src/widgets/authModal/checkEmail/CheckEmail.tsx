import { FC, type RefObject } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { ArrowIcon } from '@shared/ui/icons';

import styles from './CheckEmail.module.scss';

export interface CheckEmailProps {
  className?: string;
  onBackToRecovery: () => void;
  onClose: () => void;
  swipeCloseElementRef?: RefObject<HTMLDivElement | null>;
}

export const CheckEmail: FC<CheckEmailProps> = ({ onBackToRecovery, onClose, swipeCloseElementRef }) => {
  const { t } = useTranslation('loginModal');

  return (
    <div className={styles.container}>
      <header className={styles.header} ref={swipeCloseElementRef}>
        <Button
          variant="secondary"
          square
          icon={<ArrowIcon className={styles.arrow} />}
          className={styles.backBtn}
          onClick={onBackToRecovery}
        />
        <h3 className={styles.title}>{t('checkEmailTitle')}</h3>
      </header>
      <div className={styles.content}>
        <span className={styles.subTitle}>{t('checkEmailSubtitle')}</span>
        <Button type={'submit'} variant={'primary'} fullWidth={true} onClick={onClose}>
          {t('checkEmailClose')}
        </Button>
      </div>
    </div>
  );
};
