import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useTranslation } from 'react-i18next';

import { getCurrencySymbol, type LottieAnimationData } from '@shared/lib';

import styles from './MethodCard.module.scss';

import type { Currency, Media } from '@features/wallet/model/apiTypes.ts';

interface LottieFromUrlProps {
  media: Media;
  className?: string;
}

const LottieFromUrl: FC<LottieFromUrlProps> = ({ media, className }) => {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    if (media.type !== 'lottie' || !media.url) {
      return;
    }

    let isCancelled = false;

    const loadAnimation = async (): Promise<void> => {
      try {
        const response = await fetch(media.url);

        if (!response.ok) return;

        const json = (await response.json()) as LottieAnimationData;

        if (!isCancelled) {
          setAnimationData(json);
        }
      } catch {
        // ignore loading errors for now
      }
    };

    loadAnimation();

    return () => {
      isCancelled = true;
    };
  }, [media]);

  if (!animationData) {
    return null;
  }

  const handleMouseEnter = (): void => {
    if (!lottieRef.current) return;

    lottieRef.current.setSpeed(1);
    lottieRef.current.setDirection(1);
    lottieRef.current.play();
  };

  const handleMouseLeave = (): void => {
    if (!lottieRef.current) return;

    lottieRef.current.setSpeed(1);
    lottieRef.current.setDirection(-1);
    lottieRef.current.play();
  };

  return (
    <div className={className} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Lottie lottieRef={lottieRef} animationData={animationData} loop={false} autoplay={false} />
    </div>
  );
};

export interface MethodCardProps {
  title: string;
  currency: Currency;
  min?: number | string | null;
  network?: string;
  media: Media | null;
  onClick?: () => void;
  isBanking?: boolean;
  className?: string;
}

export const MethodCard: FC<MethodCardProps> = ({
  title,
  currency,
  min,
  network,
  media,
  onClick,
  isBanking = false,
  className,
}) => {
  const { t } = useTranslation('walletModal');

  const onClickHandler = (): void => {
    onClick?.();
  };

  if (media?.type === 'lottie') {
    return (
      <div className={clsx(styles.item, className)} onClick={onClickHandler}>
        <div className={styles.info}>
          <h4 className={styles.title}>{title}</h4>
          {network && <p className={styles.network}>{network}</p>}

          {min && +min > 0 && (
            <p className={styles.min}>
              {t('methods.minPrefix')} {min} {getCurrencySymbol(currency)}
            </p>
          )}
        </div>
        <LottieFromUrl media={media} className={styles.animationWrapper} />
      </div>
    );
  }

  if (media?.type === 'image') {
    return (
      <div
        className={clsx(styles.item, isBanking && styles.isBanking, className)}
        onClick={onClickHandler}
        style={{ '--image-url': `url(${media.url})` } as CSSProperties}
      >
        <div className={styles.info}>
          <h4 className={styles.title}>{title}</h4>
          {network && <p className={styles.network}>{network}</p>}

          {min && +min > 0 && (
            <p className={styles.min}>
              {t('methods.minPrefix')} {min} {getCurrencySymbol(currency)}
            </p>
          )}
        </div>
      </div>
    );
  }
};
