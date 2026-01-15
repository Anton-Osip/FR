import { type FC, useRef } from 'react';

import clsx from 'clsx';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useTranslation } from 'react-i18next';

import heroCashbackAnimation from '@shared/assets/animations/heroCashbackAnimation.json';
import { Button } from '@shared/ui';

import styles from './CashbackCard.module.scss';

interface CashbackCardProps {
  className?: string;
}

export const CashbackCard: FC<CashbackCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const cashbackAmount = '30,74';
  const lottieRef = useRef<LottieRefCurrentProps>(null);

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
      className={clsx(styles.cashbackCard, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('cashbackCard.title')}</h3>
          <p className={styles.description}>{t('cashbackCard.description')}</p>
        </div>
        <div className={styles.button}>
          <Button size={'m'}>
            {t('cashbackCard.claim')} {cashbackAmount} ₽
          </Button>
        </div>
      </div>
      <div className={styles.imageWrapper}>
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
