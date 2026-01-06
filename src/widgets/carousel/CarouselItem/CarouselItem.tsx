import { memo, type FC } from 'react';

import clsx from 'clsx';

import styles from './CarouselItem.module.scss';

interface Props {
  img: string;
  link: string;
  isPopular: boolean;
}

const CarouselItemComponent: FC<Props> = ({ img, link, isPopular }) => {
  return (
    <a href={link} className={styles.carouselItem} draggable={false}>
      <img
        src={img}
        alt=""
        className={clsx(styles.carouselItemImage, { [styles.isPopular]: isPopular })}
        draggable={false}
      />
    </a>
  );
};

export const CarouselItem = memo(CarouselItemComponent);

CarouselItem.displayName = 'CarouselItem';
