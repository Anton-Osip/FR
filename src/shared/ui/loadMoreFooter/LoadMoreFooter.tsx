import { FC, ReactNode } from 'react';

import clsx from 'clsx';

import { Button } from '@shared/ui/button';
import { RepeatIcon } from '@shared/ui/icons';

import styles from './LoadMoreFooter.module.scss';

export interface LoadMoreFooterProps {
  shown: number;
  total: number;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  shownLabel: string;
  ofLabel: string;
  showMoreLabel: string;
  className?: string;
  loadingSpinner?: ReactNode;
}

export const LoadMoreFooter: FC<LoadMoreFooterProps> = ({
  shown,
  total,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  shownLabel,
  ofLabel,
  showMoreLabel,
  className,
  loadingSpinner,
}) => {
  return (
    <div className={clsx(styles.footer, className)}>
      <p className={styles.text}>
        {shownLabel}: {shown} {ofLabel} {total}
      </p>
      {hasMore && (
        <Button
          variant={'tertiary'}
          size={'s'}
          icon={isLoading ? loadingSpinner || <div className={styles.spinner} /> : <RepeatIcon />}
          onClick={onLoadMore}
          disabled={isLoading}
          className={clsx(isLoading && styles.loadingButton)}
        >
          {showMoreLabel}
        </Button>
      )}
    </div>
  );
};

LoadMoreFooter.displayName = 'LoadMoreFooter';
