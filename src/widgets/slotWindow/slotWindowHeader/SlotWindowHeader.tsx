import { FC } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { Button, Tabs } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { ArrowIcon, HeartIcon, MaximizeIcon, RectangleIcon } from '@shared/ui/icons';

import styles from './SlotWindowHeader.module.scss';

import { useAddFavoriteMutation, useRemoveFavoriteMutation } from '@features/showcase';

interface SlotWindowHeaderProps {
  className?: string;
  gameName: string;
  isFavorite: boolean;
  TabsItems: Tab[];
  setTabsItem: (value: string) => void;
  isLoading?: boolean;
  gameUuid: string;
}

export const SlotWindowHeader: FC<SlotWindowHeaderProps> = ({
  className,
  gameName,
  TabsItems,
  setTabsItem,
  isFavorite,
  isLoading = false,
  gameUuid,
}) => {
  const navigate = useNavigate();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const handleBackClick = (): void => {
    navigate(-1);
  };

  const handleFavoriteClick = async (): Promise<void> => {
    if (isFavorite) {
      await removeFavorite({ game_uuid: gameUuid }).unwrap();
    } else {
      await addFavorite({ game_uuid: gameUuid }).unwrap();
    }
  };

  return (
    <div className={clsx(styles.slotWindowHeader, className)}>
      <div className={styles.left}>
        <Button
          variant="secondary"
          square
          icon={<ArrowIcon className={styles.arrow} />}
          className={styles.backBtn}
          onClick={handleBackClick}
        />
        {isLoading ? (
          <div className={clsx(styles.gameName, styles.skeletonText)} />
        ) : (
          <h4 className={styles.gameName}>{gameName}</h4>
        )}
      </div>
      <div className={styles.right}>
        <Tabs items={TabsItems} onChange={setTabsItem} className={styles.tabs} />
        <Button
          icon={<HeartIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.heart, isFavorite && styles.isFavorite)}
          onClick={handleFavoriteClick}
        />
        <Button icon={<RectangleIcon />} variant="secondary" square className={clsx(styles.button, styles.rectangle)} />
        <Button icon={<MaximizeIcon />} variant="secondary" square className={clsx(styles.button, styles.maximize)} />
      </div>
    </div>
  );
};
