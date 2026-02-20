import { FC, useEffect, useRef, useState } from 'react';

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

interface MediaRendererProps {
  media: Media | null;
  isBanking?: boolean;
}

const MediaRenderer: FC<MediaRendererProps> = ({ media, isBanking = false }) => {
  if (!media) {
    return null;
  }

  if (media.type === 'image') {
    return (
      <div className={clsx(styles.imageWrapper, isBanking && styles.isBankingImage)}>
        <img src={media.url} alt="" />
      </div>
    );
  }

  if (media.type === 'lottie') {
    return <LottieFromUrl media={media} className={styles.animationWrapper} />;
  }

  return null;
};

export interface MethodCardProps {
  title: string;
  currency: Currency;
  min: number | string | null;
  network?: string;
  media: Media | null;
  onClick?: () => void;
  isBanking?: boolean;
}

export const MethodCard: FC<MethodCardProps> = ({
  title,
  currency,
  min,
  network,
  media,
  onClick,
  isBanking = false,
}) => {
  const { t } = useTranslation('walletModal');

  const onClickHandler = (): void => {
    onClick?.();
  };

  return (
    <div className={styles.item} onClick={onClickHandler}>
      <div className={styles.info}>
        <div>
          <h4 className={styles.title}>{title}</h4>
          {network && <p className={styles.min}>{network}</p>}
        </div>

        {min && +min > 0 && (
          <p className={styles.min}>
            {t('methods.minPrefix')} {min} {getCurrencySymbol(currency)}
          </p>
        )}
      </div>
      <MediaRenderer media={media} isBanking={isBanking} />
    </div>
  );
};
