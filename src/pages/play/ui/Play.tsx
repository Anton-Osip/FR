import { FC, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { APP_PATH } from '@shared/config';
import { useMediaQuery } from '@shared/lib';
import { EmptyState, Spinner } from '@shared/ui';

import { useFullscreenRedux, useSlotGameUrl } from '@widgets/slotWindow/hooks';

import styles from './Play.module.scss';

export const Play: FC = () => {
  const navigate = useNavigate();
  const { id: gameUuid } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('mode') ?? 'demo';
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 760px)');
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const { t } = useTranslation('slot');

  // Сбрасываем состояние загрузки при изменении gameUrl
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIframeLoading(true);
  }, [gameUuid]);

  const handleIframeLoad = (): void => {
    setIsIframeLoading(false);
  };

  useEffect(() => {
    if (isDesktop) {
      navigate(APP_PATH.slot.replace(':id', String(gameUuid)));
    }
  }, [gameUuid, isDesktop, navigate]);

  useFullscreenRedux(gameWrapperRef);

  const { gameUrl, isGameLoading, isError } = useSlotGameUrl({ gameUuid, activeTab });

  const gameTitle = activeTab === 'demo' ? 'Slot Game Demo' : 'Slot Game';
  const showLoader = !isError && (isGameLoading || (gameUrl && isIframeLoading));

  return (
    <div className={styles.play}>
      <div ref={gameWrapperRef} className={styles.gameWrapper}>
        <div className={styles.gameContent}>
          {isError && <EmptyState className={styles.error} title={t('error.title')} subtitle={t('error.subtitle')} />}
          {gameUrl && (
            <iframe
              src={gameUrl}
              title={gameTitle}
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
      </div>
    </div>
  );
};
