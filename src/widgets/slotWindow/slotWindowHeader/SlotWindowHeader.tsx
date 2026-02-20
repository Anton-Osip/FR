import { FC } from 'react';

import clsx from 'clsx';

import { Button, Tabs } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { ArrowIcon, HeartIcon, MaximizeIcon, RectangleIcon, SquareIcon } from '@shared/ui/icons';

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
}) => {
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
        <Tabs items={tabsItems} onChange={onTabChange} className={styles.tabs} />
        <Button
          icon={<HeartIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.heart, isFavorite && styles.isFavorite)}
          onClick={onFavoriteClick}
        />
        <Button
          icon={!isTheatreMode ? <SquareIcon /> : <RectangleIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.rectangle, isTheatreMode && styles.square)}
          onClick={onTheatreModeToggle}
        />
        <Button
          icon={<MaximizeIcon />}
          variant="secondary"
          square
          className={clsx(styles.button, styles.maximize, isFullscreen && styles.fullScreen)}
          onClick={onFullscreenToggle}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        />
      </div>
    </div>
  );
};
