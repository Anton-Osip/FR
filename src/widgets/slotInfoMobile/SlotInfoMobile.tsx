import { FC } from 'react';

import clsx from 'clsx';
import { useParams } from 'react-router-dom';

import { Button, ToggleSwitch } from '@shared/ui';
import { HeartIcon } from '@shared/ui/icons';

import styles from './SlotInfoMobile.module.scss';

import { useAddFavoriteMutation, useGetSlotInfoQuery, useRemoveFavoriteMutation } from '@features/showcase';
interface SlotInfoMobileProps {
  className?: string;
}

export const SlotInfoMobile: FC<SlotInfoMobileProps> = ({ className }) => {
  const { id: gameUuid } = useParams<{ id: string }>();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const { data: slotInfo, isLoading } = useGetSlotInfoQuery(
    { game_uuid: gameUuid! },
    {
      skip: !gameUuid,
    },
  );

  const handleFavoriteClick = async (): Promise<void> => {
    if (!slotInfo || !gameUuid) {
      return;
    }

    if (slotInfo.is_favorite) {
      await removeFavorite({ game_uuid: gameUuid }).unwrap();
    } else {
      await addFavorite({ game_uuid: gameUuid }).unwrap();
    }
  };

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
          <div className={styles.toggleContainer}>
            <ToggleSwitch isOn={true} onToggle={() => {}} />
            <span className={styles.fullscreenLabel}>Полный экран</span>
          </div>
        </div>
      </div>

      <div className={styles.controlWrapper}>
        <Button fullWidth={true} size={'s'}>
          Играть
        </Button>
        <Button variant={'tertiary'} fullWidth={true} size={'s'}>
          Демо
        </Button>
      </div>
    </div>
  );
};
