import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';

import styles from './CheckEmail.module.scss';

export interface CheckEmailProps {
  className?: string;
  onClose: () => void;
}

export const CheckEmail: FC<CheckEmailProps> = ({ onClose }) => {
  const { t } = useTranslation('loginModal');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.subTitle}>{t('checkEmailSubtitle')}</span>
        <Button type={'submit'} variant={'primary'} fullWidth={true} onClick={onClose}>
          {t('checkEmailClose')}
        </Button>
      </div>
    </div>
  );
};
