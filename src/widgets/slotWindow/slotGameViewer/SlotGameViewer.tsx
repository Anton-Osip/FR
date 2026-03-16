import { FC, useEffect, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@shared/ui';

import styles from './SlotGameViewer.module.scss';

import { Spinner } from '@/shared/ui/spinner/Spinner';

interface SlotGameViewerProps {
  gameUrl?: string;
  isTheatreMode: boolean;
  isLoading: boolean;
  className?: string;
  isError: boolean;
}

export const SlotGameViewer: FC<SlotGameViewerProps> = ({ gameUrl, isTheatreMode, isLoading, className, isError }) => {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const { t } = useTranslation('slot');

  // Сбрасываем состояние загрузки при изменении gameUrl
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIframeLoading(true);
  }, [gameUrl]);

  const handleIframeLoad = (): void => {
    setIsIframeLoading(false);
  };

  const showLoader = !isError && (isLoading || (gameUrl && isIframeLoading));

  return (
    <div className={clsx(styles.gameContent, isTheatreMode && styles.theatreMode, className)}>
      {isError && <EmptyState className={styles.error} title={t('error.title')} subtitle={t('error.subtitle')} />}

      {gameUrl && (
        <iframe
          src={gameUrl}
          title="Slot Demo"
          allow="fullscreen; autoplay; encrypted-media"
          allowFullScreen
          style={{
            pointerEvents: 'auto',
            opacity: showLoader ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
          onLoad={handleIframeLoad}
        />
      )}
      {showLoader && (
        <div className={styles.loaderOverlay}>
          <Spinner />
        </div>
      )}
    </div>
  );
};
