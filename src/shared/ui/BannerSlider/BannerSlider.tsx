import { type FC, type ReactElement, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import styles from './BannerSlider.module.scss';

const DEFAULT_SLIDES = [1];

type BannerSliderProps = {
  slides?: number[];
};

export const BannerSlider: FC<BannerSliderProps> = ({ slides = DEFAULT_SLIDES }) => {
  const { t } = useTranslation('walletModal');
  const stableSlides = useMemo(() => slides, [slides]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.pagination}>
        {stableSlides.map((idx, index) => (
          <div key={idx} className={clsx(styles.dot, activeIndex === index ? styles.activeDote : '')} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.slider}>
      <Swiper
        modules={[Autoplay]}
        loop={slides.length > 1}
        speed={800}
        onSlideChange={handleSlideChange}
        className={styles.bannerSwiper}
        slidesPerView={1}
        spaceBetween={16}
      >
        {stableSlides.map(slide => (
          <SwiperSlide key={slide} className={styles.bannerSlide}>
            <div className={styles.bannerSlideWrapper}>
              <h3 className={styles.bannerTitle}>{t('bannerTitle')}</h3>

              <div className={styles.bannerImg} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {stableSlides.length > 1 && renderCustomPagination()}
    </div>
  );
};
