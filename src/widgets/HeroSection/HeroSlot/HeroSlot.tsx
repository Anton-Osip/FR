import { type FC, type ReactElement, useState } from 'react';

import { useTranslation } from 'react-i18next';
import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';

import styles from './HeroSlot.module.scss';
import slotImage from '/src/assets/images/hero-slot.png';

const MIN_SLIDES_FOR_LOOP = 3;

export const HeroSlot: FC = () => {
  const { t } = useTranslation('home');
  const slides = [1];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
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
            <div className={styles.heroSlot}>
              <h3 className={styles.slotTitle}>{t('heroSlot.title')}</h3>

              <div className={styles.slotCardWrapper}>
                <img src={slotImage} alt={t('heroSlot.title')} draggable={false} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && renderCustomPagination()}
    </div>
  );
};
