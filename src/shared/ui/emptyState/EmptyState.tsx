import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LogoErrorIcon } from '@shared/ui/icons';

import { Button } from '../button';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  className?: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  withButton?: boolean;
  buttonText?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ className, title, subtitle, onClick, withButton, buttonText }) => {
  const { t } = useTranslation('emptyState');

  const displayTitle = title ?? t('title');
  const displaySubtitle = subtitle ?? t('subtitle');
  const displayButtonText = buttonText ?? t('initError.reloadButton');

  return (
    <div className={clsx(styles.emptyState, className)}>
      <LogoErrorIcon />
      <span className={styles.title}>{displayTitle}</span>
      {displaySubtitle && <span className={styles.subtitle}>{displaySubtitle}</span>}
      {withButton && (
        <Button className={styles.btn} onClick={onClick}>
          {displayButtonText}
        </Button>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
