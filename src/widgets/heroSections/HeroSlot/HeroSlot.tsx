import { type FC, type ReactElement, useMemo, useRef, useState } from 'react';

import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/autoplay';
import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import heroSlotAnimation from '@shared/assets/animations/heroSlotAnimation.json';
import { APP_PATH } from '@shared/config';
import { replaceImageInAnimation } from '@shared/lib';

import styles from './HeroSlot.module.scss';

import { useGetFeaturedSlotQuery } from '@features/showcase';

const MIN_SLIDES_FOR_LOOP = 3;

export const HeroSlot: FC = () => {
  const { t } = useTranslation('home');
  const slides = [1];
  const [activeIndex, setActiveIndex] = useState(0);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const deviceType = useAppSelector(selectDeviceType);

  const { data: featuredSlot, isLoading } = useGetFeaturedSlotQuery({ kind: 'weekly' });

  const gameLink = useMemo(() => {
    if (!featuredSlot) return null;

    const game = deviceType === 'mobile' ? featuredSlot.mobile : featuredSlot.desktop;

    return APP_PATH.slot.replace(':id', game.uuid);
  }, [featuredSlot, deviceType]);

  const modifiedAnimation = useMemo(() => {
    if (!featuredSlot?.image) {
      return heroSlotAnimation;
    }

    return replaceImageInAnimation(heroSlotAnimation, featuredSlot.image);
  }, [featuredSlot]);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

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

  const renderCustomPagination = (): ReactElement => {
    const dotsBefore = Array.from({ length: activeIndex }, (_, idx) => idx);
    const dotsAfter = Array.from({ length: slides.length - activeIndex - 1 }, (_, idx) => idx + activeIndex + 1);

    return (
      <div className={styles.slotPagination}>
        {dotsBefore.map(idx => (
          <div key={idx} className={styles.slotDot} aria-label={`${t('heroSlot.slide')} ${idx + 1}`} />
        ))}

        <div className={styles.slotPaginationBar} />

        {dotsAfter.map(targetIndex => (
          <div key={targetIndex} className={styles.slotDot} aria-label={`${t('heroSlot.slide')} ${targetIndex + 1}`} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.slotCarousel}>
      <Swiper
        modules={[Autoplay]}
        loop={slides.length > MIN_SLIDES_FOR_LOOP}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: true,
        }}
        allowTouchMove={false}
        onSlideChange={handleSlideChange}
        className={styles.slotViewport}
        slidesPerView={1}
        spaceBetween={16}
      >
        {slides.map(slide => (
          <SwiperSlide key={slide} className={styles.slotSlide}>
            {gameLink && !isLoading ? (
              <Link
                to={gameLink}
                className={styles.heroSlot}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                draggable={false}
              >
                <h3 className={styles.slotTitle}>{t('heroSlot.title')}</h3>

                <div className={styles.slotCardWrapper}>
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={modifiedAnimation}
                    className={styles.slotImage}
                    loop={false}
                    autoplay={false}
                  />
                </div>
              </Link>
            ) : (
              <div
                className={styles.heroSlot}
                onMouseEnter={!isLoading ? handleMouseEnter : undefined}
                onMouseLeave={!isLoading ? handleMouseLeave : undefined}
              >
                <h3 className={styles.slotTitle}>{t('heroSlot.title')}</h3>

                <div className={styles.slotCardWrapper}>
                  {isLoading ? (
                    <div className={styles.skeleton} />
                  ) : (
                    <Lottie
                      lottieRef={lottieRef}
                      animationData={modifiedAnimation}
                      className={styles.slotImage}
                      loop={false}
                      autoplay={false}
                    />
                  )}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && renderCustomPagination()}
    </div>
  );
};
