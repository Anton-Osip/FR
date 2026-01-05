import { memo, type FC } from 'react';

import styles from './CarouselItem.module.scss';

interface Props {
  img: string;
  link: string;
}

const CarouselItemComponent: FC<Props> = ({ img, link }) => {
  return (
    <a href={link} className={styles.carouselItem} draggable={false}>
      <img src={img} alt="" className={styles.carouselItemImage} draggable={false} />
    </a>
  );
};

export const CarouselItem = memo(CarouselItemComponent);

CarouselItem.displayName = 'CarouselItem';
