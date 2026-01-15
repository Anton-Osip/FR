import { type FC, useEffect, useRef } from 'react';

import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

import styles from './CashbackSlide.module.scss';

import heroCashbackAnimation from '@assets/animations/heroCashbackAnimation.json';

interface CashbackSlideProps {
  title: string;
  titleSecondLine: string;
}

export const CashbackSlide: FC<CashbackSlideProps> = ({ title, titleSecondLine }) => {
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
    <div className={styles.heroCashback} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <h3 className={styles.cashbackTitle}>
        {title} <br />
        {titleSecondLine}
      </h3>

      <div className={styles.cashbackCardWrapper}>
        <Lottie
          lottieRef={lottieRef}
          animationData={heroCashbackAnimation}
          className={styles.slotImage}
          loop={false}
          autoplay={false}
        />
      </div>
    </div>
  );
};
