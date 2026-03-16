import { FC, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { selectIsFullscreen, selectIsLoggedIn, setFullscreen } from '@app/store';

import { useAppDispatch, useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config/routes';
import { useMediaQuery } from '@shared/lib';
import { Button, ToggleSwitch } from '@shared/ui';
import { HeartIcon } from '@shared/ui/icons';

import { AuthModal } from '@widgets/authModal';

import styles from './SlotInfoMobile.module.scss';

import { useAddFavoriteMutation, useGetSlotInfoQuery, useRemoveFavoriteMutation } from '@features/showcase';

interface SlotInfoMobileProps {
  className?: string;
}

export const SlotInfoMobile: FC<SlotInfoMobileProps> = ({ className }) => {
  const { t } = useTranslation(['slot', 'header']);
  const [authModal, setAuthModal] = useState(false);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: gameUuid } = useParams<{ id: string }>();
  const isFullscreen = useAppSelector(selectIsFullscreen);
  const isDesktop = useMediaQuery('(min-width: 760px)');
  const handleFullscreenToggle = (nextValue: boolean): void => {
    dispatch(setFullscreen({ isFullscreen: nextValue }));
  };

  // Очистка fullscreen состояния при размонтировании
  useEffect(() => {
    return () => {
      dispatch(setFullscreen({ isFullscreen: false }));
    };
  }, [dispatch]);
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const { data: slotInfo, isLoading } = useGetSlotInfoQuery(
    { game_uuid: gameUuid! },
    {
      skip: !gameUuid,
    },
  );

  const handleFavoriteClick = async (): Promise<void> => {
    if (!isLoggedIn) {
      setAuthModal(true);
    }

    if (!slotInfo || !gameUuid) {
      return;
    }

    if (slotInfo.is_favorite) {
      await removeFavorite({ game_uuid: gameUuid }).unwrap();
    } else {
      await addFavorite({ game_uuid: gameUuid }).unwrap();
    }
  };

  const handleTabChange = (mode: string): void => {
    if (!gameUuid) return;
    const path = APP_PATH.play.replace(':id', gameUuid);

    navigate(`${path}?mode=${mode}`);
  };

  const onClickPlayBtn = (): void => {
    if (!isLoggedIn) {
      setAuthModal(true);
    } else {
      handleTabChange('play');
    }
  };

  const loginButton = useMemo(() => {
    if (isLoggedIn) return null;

    return (
      <AuthModal
        trigger={
          <Button fullWidth={true} size={'s'} variant={'primary'}>
            {t('buttons.play')}
          </Button>
        }
      />
    );
  }, [isLoggedIn, t]);

  return (
    <div className={clsx(styles.slotInfoMobile, className)}>
      <div className={styles.infoWrapper}>
        <div className={styles.image}>
          {isLoading ? <div className={styles.skeletonImage} /> : <img src={slotInfo?.image} alt="slot" />}
        </div>

        <div className={styles.info}>
          <div className={styles.header}>
            <div className={styles.titles}>
              {isLoading ? (
                <>
                  <div className={clsx(styles.title, styles.skeletonText)} />
                  <div className={clsx(styles.description, styles.skeletonText)} />
                </>
              ) : (
                <>
                  <h2 className={styles.title}>{slotInfo?.name}</h2>
                  <p className={styles.description}>{slotInfo?.provider.name}</p>
                </>
              )}
            </div>
            <Button
              variant={'ghost'}
              icon={<HeartIcon />}
              onClick={handleFavoriteClick}
              className={clsx(styles.heartIcon, slotInfo?.is_favorite && styles.isFavorite)}
            />
          </div>
          <div className={styles.toggleWrapper}>
            <div className={styles.toggleContainer}>
              <ToggleSwitch isOn={isFullscreen} onToggle={handleFullscreenToggle} />
              <span className={styles.fullscreenLabel}>{t('labels.fullscreen')}</span>
            </div>
            {!isLoggedIn && isDesktop && loginButton}
          </div>
        </div>
      </div>

      <div className={styles.controlWrapper}>
        {!isDesktop && (
          <Button fullWidth={true} size={'s'} onClick={onClickPlayBtn} variant={'primary'}>
            {t('buttons.play')}
          </Button>
        )}
        {slotInfo?.provider.supports_demo && (
          <Button variant={'tertiary'} fullWidth={true} size={'s'} onClick={() => handleTabChange('demo')}>
            {t('buttons.demo')}
          </Button>
        )}
      </div>
      <AuthModal open={authModal} onOpenChange={setAuthModal} />
    </div>
  );
};
