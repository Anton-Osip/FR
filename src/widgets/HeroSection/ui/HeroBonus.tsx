import { type FC, type ReactElement, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';

import { Button } from '@shared/ui';

import styles from '../HeroBonus.module.scss';

import animation from '@assets/images/hero-bonus.png';

export const HeroBonus: FC = () => {
  const slides = [1];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.heroBonusPagination}>
        {slides.map((idx, index) => (
          <div
            key={idx}
            className={`${styles.bonusDot} ${selectedIndex === index ? styles.activeDote : ''}`}
            aria-label={`Слайд ${idx + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.heroBonusCarousel}>
      <div className={styles.heroBonusViewport}>
        <Swiper
          className={styles.heroBonusContainer}
          slidesPerView={1}
          speed={800}
          spaceBetween={16}
          onSlideChange={swiperInstance => setSelectedIndex(swiperInstance.realIndex)}
        >
          {slides.map(slide => (
            <SwiperSlide className={styles.heroBonusSlide} key={slide}>
              <div className={styles.heroBonus}>
                <h3 className={styles.title}>
                  Бонус до
                  <br /> на первый депозит
                </h3>

                <Button className={styles['hero-bonus-button']}>Подробнее</Button>
                <div className={styles.bonusAnimation}>
                  <img src={animation} alt="bonus-animation" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {slides.length > 1 && renderCustomPagination()}
    </div>
  );
};
