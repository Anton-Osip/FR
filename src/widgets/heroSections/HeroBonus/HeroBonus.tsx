import { type FC, type ReactElement, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';

import { HeroBonusSled } from '@widgets/heroSections/HeroBonus/HeroBonusSlide/HeroBonusSlide.tsx';

import styles from './HeroBonus.module.scss';

interface IHeroBonusSlide {
  element: ReactElement;
  id: string;
}

export const HeroBonus: FC = () => {
  const { t } = useTranslation('home');

  const slides: IHeroBonusSlide[] = [
    {
      element: <HeroBonusSled />,
      id: 'HeroBonusSled',
    },
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.heroBonusPagination} role="tablist" aria-label={t('heroBonus.slide')}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(styles.bonusDot, selectedIndex === index ? styles.activeDote : '')}
            role="tab"
            aria-selected={selectedIndex === index}
            aria-label={`${t('heroBonus.slide')} ${slide.id}`}
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
            <SwiperSlide className={styles.heroBonusSlide} key={slide.id}>
              {slide.element}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {slides.length > 1 && renderCustomPagination()}
    </div>
  );
};
