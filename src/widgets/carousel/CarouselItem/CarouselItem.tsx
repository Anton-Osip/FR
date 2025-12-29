import { memo, type FC } from 'react';

import styles from './CarouselItem.module.scss';

interface Props {
  img: string;
  link: string;
}

const CarouselItemComponent: FC<Props> = ({ img, link }) => {
  return (
    <a href={link} className={styles['carousel-item']} draggable={false}>
      <img src={img} alt="" className={styles['carousel-item__image']} draggable={false} />
    </a>
  );
};

export const CarouselItem = memo(CarouselItemComponent);

CarouselItem.displayName = 'CarouselItem';
