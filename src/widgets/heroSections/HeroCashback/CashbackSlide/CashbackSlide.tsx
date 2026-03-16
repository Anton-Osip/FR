import { type FC, useEffect, useRef } from 'react';

import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

import styles from './CashbackSlide.module.scss';

interface AnimationMedia {
  type: 'animation';
  url: unknown;
}
interface ImageMedia {
  type: 'image';
  url: string;
}

export interface ISlides {
  id: number;
  media: AnimationMedia | ImageMedia;
  title: string;
  titleSecondLine: string;
  onClick: () => void;
}

interface CashbackSlideProps {
  slide: ISlides;
}

export const CashbackSlide: FC<CashbackSlideProps> = ({ slide }) => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1);
    }
  }, []);

  const handleMouseEnter = (): void => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1);
      lottieRef.current.setDirection(1);
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = (): void => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1);
      lottieRef.current.setDirection(-1);
      lottieRef.current.play();
    }
  };

  return (
    <div
      className={styles.heroCashback}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={slide.onClick}
    >
      <h3 className={styles.cashbackTitle}>
        {slide.title} <br />
        {slide.titleSecondLine}
      </h3>

      {slide.media.type === 'animation' && (
        <div className={styles.cashbackCardWrapper}>
          <Lottie
            lottieRef={lottieRef}
            animationData={slide.media.url}
            className={styles.slotImage}
            loop={false}
            autoplay={false}
          />
        </div>
      )}

      {slide.media.type === 'image' && (
        <div className={styles.cashbackCardWrapper}>
          <img draggable="false" src={slide.media.url} alt={slide.title} />
        </div>
      )}
    </div>
  );
};
