import { memo, type FC } from 'react';

import styles from './CarouselItem.module.scss';

interface Props {
  img: string;
  link: string;
}

const CarouselItemComponent: FC<Props> = ({ img, link }) => {
  return (
    <a href={link} className={styles['carousel-item']} style={{ backgroundImage: `url(${img})` }} draggable={false}></a>
  );
};

export const CarouselItem = memo(CarouselItemComponent);

CarouselItem.displayName = 'CarouselItem';
