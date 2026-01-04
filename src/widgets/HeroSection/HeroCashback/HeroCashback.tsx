import { type FC, type ReactElement, useState } from 'react';

import { useTranslation } from 'react-i18next';
import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import styles from './HeroCashback.module.scss';
import slotImage from '/src/assets/images/hero-cashback.png';

import 'swiper/css';
import 'swiper/css/autoplay';

const SLIDES_COUNT = 4;
const FIRST_SLIDE = 1;
const SECOND_SLIDE = 2;
const THIRD_SLIDE = 3;
const SLIDE_INDICES = [FIRST_SLIDE, SECOND_SLIDE, THIRD_SLIDE, SLIDES_COUNT];

export const HeroCashback: FC = () => {
  const { t } = useTranslation('home');
  const slides = SLIDE_INDICES;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.cashbackPagination}>
        {slides.map((idx, index) => (
          <div
            key={idx}
            className={`${styles.cashbackDot} ${activeIndex === index ? styles.activeDote : ''}`}
            aria-label={`${t('heroCashback.slide')} ${idx + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles['hero-cashback']}>
      <Swiper
        modules={[Autoplay]}
        loop={true}
        speed={800}
        autoplay={{
          delay: 5000,
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
          <SwiperSlide key={slide} className={styles.cashbackSlide}>
            <div className={styles.heroCashback}>
              <h3 className={styles.cashbackTitle}>
                {t('heroCashback.title')} <br />
                {t('heroCashback.titleSecondLine')}
              </h3>

              <div className={styles.cashbackCardWrapper}>
                <img
                  src={slotImage}
                  alt={`${t('heroCashback.title')} ${t('heroCashback.titleSecondLine')}`}
                  draggable={false}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {renderCustomPagination()}
    </div>
  );
};
