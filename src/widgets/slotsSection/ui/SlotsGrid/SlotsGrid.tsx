import { FC } from 'react';

import clsx from 'clsx';

import { Spinner } from '@shared/ui';

import styles from './SlotsGrid.module.scss';

import { CarouselItem } from '@/widgets';

interface SlotsGridProps {
  className?: string;
  items: {
    id: number;
    type: 'item';
    img: string;
    link: string;
    is_favorite: boolean;
    blocked_countries: boolean;
  }[];
  isLoading?: boolean;
}

export const SlotsGrid: FC<SlotsGridProps> = ({ className, items, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyMessage}>
        <span>Ничего не найдено</span>
      </div>
    );
  }

  return (
    <div className={clsx(styles.slotsGrid, className)}>
      {items.map(item => (
        <CarouselItem data={item} key={item.id} className={styles.item} />
      ))}
    </div>
  );
};
