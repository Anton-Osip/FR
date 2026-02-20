import { FC, useRef } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { Spinner } from '@shared/ui';

import { useFullscreenRedux, useSlotGameUrl } from '@widgets/slotWindow/hooks';

import styles from './Play.module.scss';

export const Play: FC = () => {
  const { id: gameUuid } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('mode') ?? 'demo';
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  useFullscreenRedux(gameWrapperRef);

  const { gameUrl, isGameLoading } = useSlotGameUrl({ gameUuid, activeTab });

  const gameTitle = activeTab === 'demo' ? 'Slot Game Demo' : 'Slot Game';

  return (
    <div className={styles.play}>
      <div ref={gameWrapperRef} className={styles.gameWrapper}>
        <div className={styles.gameContent}>
          {gameUrl && (
            <iframe
              src={gameUrl}
              title={gameTitle}
              allow="fullscreen; autoplay; encrypted-media"
              allowFullScreen
              style={{ pointerEvents: 'auto' }}
            />
          )}
          {isGameLoading && (
            <div className={styles.loaderOverlay}>
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
