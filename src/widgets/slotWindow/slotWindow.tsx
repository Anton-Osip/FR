import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { Tab } from '@shared/ui';

import { AuthModal } from '@widgets/authModal';
import { SlotInfoMobile } from '@widgets/slotInfoMobile';

import { useFullscreen, useSlotGame, useSlotGameUrl } from './hooks';
import { SlotGameViewer } from './slotGameViewer';
import styles from './slotWindow.module.scss';
import { SlotWindowHeader } from './slotWindowHeader';

import { useAddFavoriteMutation, useGetSlotInfoQuery, useRemoveFavoriteMutation } from '@features/showcase';

// Constants
const SCROLL_DELAY_MS = 50;

interface SlotWindowProps {
  className?: string;
}

export const SlotWindow: FC<SlotWindowProps> = ({ className }) => {
  const { t } = useTranslation('slot');
  const { id: gameUuid } = useParams<{ id: string }>();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [activeTab, setActiveTab] = useState<string>('play');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const effectiveActiveTab = isLoggedIn ? activeTab : 'demo';

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === 'play' && !isLoggedIn) {
        setIsLoginModalOpen(true);
      } else {
        setActiveTab(value);
      }
    },
    [isLoggedIn],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(isLoggedIn ? 'play' : 'demo');
  }, [isLoggedIn]);

  const navigate = useNavigate();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const { toggleTheatreMode, isTheatreMode } = useSlotGame();
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameWrapperRef);

  const { gameUrl, isGameLoading } = useSlotGameUrl({ gameUuid, activeTab: effectiveActiveTab });

  const { data: slotInfo, isLoading } = useGetSlotInfoQuery(
    { game_uuid: gameUuid || '' },
    {
      skip: !gameUuid,
    },
  );

  const TabsItems: Tab[] = useMemo(
    () => [
      {
        id: '1',
        label: t('buttons.demo'),
        value: 'demo',
        active: effectiveActiveTab === 'demo',
        disabled: !slotInfo?.provider.supports_demo,
      },
      { id: '2', label: t('buttons.play'), value: 'play', active: effectiveActiveTab === 'play' },
    ],
    [effectiveActiveTab, slotInfo?.provider.supports_demo, t],
  );

  const handleBackClick = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const handleFavoriteClick = useCallback(async (): Promise<void> => {
    if (!gameUuid || !slotInfo) return;

    try {
      const action = slotInfo.is_favorite ? removeFavorite : addFavorite;

      await action({ game_uuid: gameUuid }).unwrap();
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  }, [gameUuid, slotInfo, removeFavorite, addFavorite]);

  // Прокрутка к элементу при включении театрального режима
  useEffect(() => {
    if (!isTheatreMode || !gameWrapperRef.current) return;

    const timeoutId = setTimeout(() => {
      gameWrapperRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }, SCROLL_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isTheatreMode]);

  if (!isLoading && !slotInfo?.provider.supports_demo && !isLoggedIn) {
    return (
      <div className={styles.slotInfoContainer}>
        <SlotInfoMobile />
      </div>
    );
  }

  return (
    <div className={clsx(styles.parent, isTheatreMode && styles.theatre, className)}>
      <div className={styles.container}>
        <div className={styles.layoutSpacing}>
          <div ref={gameWrapperRef} className={clsx(styles.gameWrapper, isTheatreMode && styles.theatreMode)}>
            {!isFullscreen && (
              <SlotWindowHeader
                gameName={slotInfo?.name ?? ''}
                isFavorite={slotInfo?.is_favorite || false}
                tabsItems={TabsItems}
                onTabChange={handleTabChange}
                isLoading={isLoading}
                onBackClick={handleBackClick}
                onFavoriteClick={handleFavoriteClick}
                onTheatreModeToggle={toggleTheatreMode}
                onFullscreenToggle={toggleFullscreen}
                isTheatreMode={isTheatreMode}
                isFullscreen={isFullscreen}
                className={styles.slotWindowHeader}
              />
            )}
            <SlotGameViewer gameUrl={gameUrl} isTheatreMode={isTheatreMode} isLoading={isGameLoading} />
          </div>
        </div>
      </div>
      <AuthModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  );
};
