import { type FC, type ReactElement, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';

import animation from '@shared/assets/images/hero-bonus.webp';
import { Button } from '@shared/ui';

import styles from './HeroBonus.module.scss';

export const HeroBonus: FC = () => {
  const { t } = useTranslation('home');
  const slides = [1];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.heroBonusPagination} role="tablist" aria-label={t('heroBonus.slide')}>
        {slides.map((idx, index) => (
          <div
            key={idx}
            className={clsx(styles.bonusDot, selectedIndex === index ? styles.activeDote : '')}
            role="tab"
            aria-selected={selectedIndex === index}
            aria-label={`${t('heroBonus.slide')} ${idx + 1}`}
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
                  {t('heroBonus.title')}
                  <br /> {t('heroBonus.titleSecondLine')}
                </h3>

                <Button className={clsx(styles['hero-bonus-button'], 'swiper-no-swiping')}>
                  {t('heroBonus.button')}
                </Button>
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
