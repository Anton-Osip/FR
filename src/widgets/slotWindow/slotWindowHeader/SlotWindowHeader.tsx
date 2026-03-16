import { FC, useState } from 'react';

import clsx from 'clsx';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { Button, Tabs } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { ArrowIcon, HeartIcon, MaximizeIcon, RectangleIcon, SquareIcon } from '@shared/ui/icons';

import { AuthModal } from '@widgets/authModal';

import styles from './SlotWindowHeader.module.scss';

interface SlotWindowHeaderProps {
  className?: string;
  gameName?: string;
  isFavorite: boolean;
  tabsItems: Tab[];
  onTabChange: (value: string) => void;
  isLoading?: boolean;
  onBackClick: () => void;
  onFavoriteClick: () => void;
  onTheatreModeToggle: () => void;
  onFullscreenToggle: () => void;
  isTheatreMode: boolean;
  isFullscreen: boolean;
  supports_demo: boolean;
  isError: boolean;
}

export const SlotWindowHeader: FC<SlotWindowHeaderProps> = ({
  className,
  gameName,
  tabsItems,
  onTabChange,
  isFavorite,
  isLoading = false,
  onBackClick,
  onFavoriteClick,
  onTheatreModeToggle,
  onFullscreenToggle,
  isTheatreMode,
  isFullscreen,
  supports_demo,
  isError,
}) => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [authModal, setAuthModal] = useState(false);

  const onClickPlayBtn = (): void => {
    if (!isLoggedIn) {
      setAuthModal(true);
    } else {
      onFavoriteClick();
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
          onClick={onBackClick}
        />
        {isLoading ? (
          <div className={clsx(styles.gameName, styles.skeletonText)} />
        ) : (
          <h4 className={styles.gameName}>{gameName || ''}</h4>
        )}
      </div>
      <div className={styles.right}>
        {supports_demo && <Tabs items={tabsItems} onChange={onTabChange} className={styles.tabs} />}
        <Button
          icon={<HeartIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.heart, isFavorite && styles.isFavorite)}
          onClick={onClickPlayBtn}
          disabled={isError}
        />
        <Button
          icon={!isTheatreMode ? <SquareIcon /> : <RectangleIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.rectangle, isTheatreMode && styles.square)}
          onClick={onTheatreModeToggle}
          disabled={isError}
        />
        <Button
          icon={<MaximizeIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.maximize, isFullscreen && styles.fullScreen)}
          onClick={onFullscreenToggle}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          disabled={isError}
        />
      </div>

      <AuthModal open={authModal} onOpenChange={setAuthModal} />
    </div>
  );
};
