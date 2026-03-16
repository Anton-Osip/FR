import { type FC, type ReactElement, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';

import { AuthModal } from '@widgets/authModal';
import { ISlides } from '@widgets/heroSections/HeroCashback/CashbackSlide/CashbackSlide.tsx';

import { CashbackSlide } from './CashbackSlide';
import styles from './HeroCashback.module.scss';

import 'swiper/css';
import 'swiper/css/autoplay';

import heroCashbackAnimation from '@assets/animations/heroCashbackAnimation.json';
import cashBackMonthly from '@assets/icons/cashbacMonthly.svg?url';
import ourTg from '@assets/icons/tgCashback.svg?url';
import { useGetLinksResolveQuery } from '@features/links';

export const HeroCashback: FC = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { data: linksResolve } = useGetLinksResolveQuery({});
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [authModalIsOpen, setAuthModalIsOpen] = useState(false);
  const slides: ISlides[] = [
    {
      id: 1,
      media: { type: 'animation', url: heroCashbackAnimation },
      title: t('heroCashback.slides.cashback.title'),
      titleSecondLine: t('heroCashback.slides.cashback.subtitle'),
      onClick: () => {
        if (isLoggedIn) {
          navigate(APP_PATH.bonuses);
        } else {
          setAuthModalIsOpen(true);
        }
      },
    },
    {
      id: 2,
      media: { type: 'image', url: cashBackMonthly },
      title: t('heroCashback.slides.monthlyCashback.title'),
      titleSecondLine: t('heroCashback.slides.monthlyCashback.subtitle'),
      onClick: () => {
        if (isLoggedIn) {
          navigate(APP_PATH.bonuses);
        } else {
          setAuthModalIsOpen(true);
        }
      },
    },
    {
      id: 3,
      media: { type: 'image', url: ourTg },
      title: t('heroCashback.slides.telegram.title'),
      titleSecondLine: t('heroCashback.slides.telegram.subtitle'),
      onClick: () => window.open(String(linksResolve?.links.user_chat), '_blank'),
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.cashbackPagination} role="tablist" aria-label={t('heroCashback.slide')}>
        {slides.map((items, index) => (
          <div
            key={items.id}
            className={clsx(styles.cashbackDot, activeIndex === index ? styles.activeDote : '')}
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`${t('heroCashback.slide')} ${items.id + 1}`}
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
          <SwiperSlide key={slide.id} className={styles.cashbackSlide}>
            <CashbackSlide slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      {renderCustomPagination()}
      <AuthModal open={authModalIsOpen} onOpenChange={setAuthModalIsOpen} />
    </div>
  );
};
