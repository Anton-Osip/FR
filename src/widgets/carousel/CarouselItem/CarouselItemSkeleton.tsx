import type { FC } from 'react';

import styles from './CarouselItem.module.scss';

export const CarouselItemSkeleton: FC = () => {
  return <div className={`${styles['carousel-item__image']} ${styles.skeleton}`} />;
};
