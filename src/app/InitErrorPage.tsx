import { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import '@shared/styles/global.scss';

import { EmptyState } from '@shared/ui';

import styles from './InitErrorPage.module.scss';

interface InitErrorPageProps {
  error?: Error | unknown;
}

export const InitErrorPage: FC<InitErrorPageProps> = ({ error }) => {
  const { t } = useTranslation('emptyState');

  const errorMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : t('initError.defaultMessage');

  const handleReload = (): void => {
    window.location.reload();
  };

  return (
    <div className={styles.errorPage}>
      <EmptyState title={t('initError.title')} subtitle={errorMessage} onClick={handleReload} withButton={true} />
    </div>
  );
};
