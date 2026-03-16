import { FC } from 'react';

import clsx from 'clsx';

import { EmptyState, Spinner } from '@shared/ui';

import styles from './SlotsGrid.module.scss';

import { CarouselItem } from '@/widgets/carouselItem';

interface SlotsGridProps {
  className?: string;
  emptyText?: { title: string; description: string };
  items: {
    id: number;
    type: 'item';
    img: string;
    link: string;
    is_favorite: boolean;
    blocked_countries: boolean;
    name: string;
  }[];
  isLoading?: boolean;
}

export const SlotsGrid: FC<SlotsGridProps> = ({ className, items, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState title={emptyText?.title} subtitle={emptyText?.description} />;
  }

  return (
    <div className={clsx(styles.slotsGrid, className)}>
      {items.map(item => (
        <CarouselItem data={item} key={item.id} className={styles.item} />
      ))}
    </div>
  );
};
