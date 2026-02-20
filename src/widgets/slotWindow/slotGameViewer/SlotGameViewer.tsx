import { FC } from 'react';

import clsx from 'clsx';

import styles from './SlotGameViewer.module.scss';

import { Spinner } from '@/shared/ui/spinner/Spinner';

interface SlotGameViewerProps {
  gameUrl?: string;
  isTheatreMode: boolean;
  isLoading: boolean;
  className?: string;
}

export const SlotGameViewer: FC<SlotGameViewerProps> = ({ gameUrl, isTheatreMode, isLoading, className }) => {
  return (
    <div className={clsx(styles.gameContent, isTheatreMode && styles.theatreMode, className)}>
      {gameUrl && (
        <iframe
          src={gameUrl}
          title="Slot Demo"
          allow="fullscreen; autoplay; encrypted-media"
          allowFullScreen
          style={{ pointerEvents: 'auto' }}
        />
      )}
      {isLoading && (
        <div className={styles.loaderOverlay}>
          <Spinner />
        </div>
      )}
    </div>
  );
};
