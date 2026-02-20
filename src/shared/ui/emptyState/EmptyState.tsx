import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LogoErrorIcon } from '@shared/ui/icons';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ className, title, subtitle }) => {
  const { t } = useTranslation('emptyState');

  const displayTitle = title ?? t('title');
  const displaySubtitle = subtitle ?? t('subtitle');

  return (
    <div className={clsx(styles.emptyState, className)}>
      <LogoErrorIcon />
      <span className={styles.title}>{displayTitle}</span>
      {displaySubtitle && <span className={styles.subtitle}>{displaySubtitle}</span>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
