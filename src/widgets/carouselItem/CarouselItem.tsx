import { memo, type FC, CSSProperties } from 'react';

import clsx from 'clsx';
import { Link } from 'react-router-dom';

import styles from './CarouselItem.module.scss';

interface Props {
  className?: string;
  data: {
    id: number;
    type: 'item';
    img: string;
    link: string;
    is_favorite: boolean;
    blocked_countries: boolean;
  };
}

const CarouselItemComponent: FC<Props> = ({ data, className }) => {
  return (
    <Link
      to={data.link}
      className={clsx(
        styles.carouselItem,
        data.blocked_countries && styles.blocked_countries,
        data.is_favorite && styles.is_favorite,
        className,
      )}
      draggable={false}
    >
      <div className={clsx(styles.carouselItemImage)} style={{ '--image-url': `url(${data.img})` } as CSSProperties} />
      {data.blocked_countries && (
        <div className={styles.blockedWrapper}>
          <div className={styles.blockedCercle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM9.625 7C9.625 7.28995 9.38995 7.525 9.1 7.525H4.9C4.61005 7.525 4.375 7.28995 4.375 7C4.375 6.71005 4.61005 6.475 4.9 6.475H9.1C9.38995 6.475 9.625 6.71005 9.625 7Z"
                fill="#727E9B"
              />
            </svg>
          </div>
          <p className={styles.blockedText}>Недоступно в вашем регионе</p>
        </div>
      )}
    </Link>
  );
};

export const CarouselItem = memo(CarouselItemComponent);

CarouselItem.displayName = 'CarouselItem';
