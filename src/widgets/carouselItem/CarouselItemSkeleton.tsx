import type { FC } from 'react';

import clsx from 'clsx';

import styles from './CarouselItem.module.scss';

export const CarouselItemSkeleton: FC = () => {
  return <div className={clsx(styles.carouselItemImage, styles.skeleton)} />;
};
