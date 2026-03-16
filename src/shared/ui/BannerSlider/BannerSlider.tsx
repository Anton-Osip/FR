import { type FC, type ReactElement, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type SwiperType from 'swiper';
import { Autoplay, FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// import bannerImg from '../../assets/images/bannerSlide.webp';
import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';

import bannerImg1 from '../../assets/images/bannerSlide1.svg?url';
import bannerImg2 from '../../assets/images/bannerSlide2.svg?url';
import bannerImg3 from '../../assets/images/bannerSlide3.svg?url';
import bannerImg4 from '../../assets/images/bannerSlide4.svg?url';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';

import styles from './BannerSlider.module.scss';

import { useGetLinksResolveQuery } from '@features/links';
import { useWalletModalUrl } from '@features/wallet/model';
export interface Slide {
  id: string;
  url: string;
  titleKey: string;
  secondTitleKey: string;
  onClick: () => void;
}

interface BannerSliderProps {
  onClick?: () => void;
}

export const BannerSlider: FC<BannerSliderProps> = ({ onClick }) => {
  const { t } = useTranslation('home');
  const { isOpen: modalWalletIsOpen, openModal: openWalletModal } = useWalletModalUrl();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { data: linksResolve } = useGetLinksResolveQuery({});
  const navigate = useNavigate();
  const slides: Slide[] = [
    // {
    //   id: '1',
    //   titleKey: 'banner.slide1.title',
    //   secondTitleKey: 'banner.slide1.secondTitle',
    //   url: bannerImg,
    // },
    {
      id: '2',
      titleKey: 'banner.slide2.title',
      secondTitleKey: 'banner.slide2.secondTitle',
      url: bannerImg1,
      onClick: () => {
        window.open(String(linksResolve?.links.news), '_blank');
      },
    },
    {
      id: '3',
      titleKey: 'banner.slide3.title',
      secondTitleKey: 'banner.slide3.secondTitle',
      url: bannerImg2,
      onClick: () => {
        navigate(APP_PATH.slots.replace(':type', 'allGames'));
        onClick?.();
      },
    },
    {
      id: '4',
      titleKey: 'banner.slide4.title',
      secondTitleKey: 'banner.slide4.secondTitle',
      url: bannerImg3,
      onClick: () => {
        if (!isLoggedIn) return;

        navigate(APP_PATH.bonuses);
        onClick?.();
      },
    },
    {
      id: '5',
      titleKey: 'banner.slide5.title',
      secondTitleKey: 'banner.slide5.secondTitle',
      url: bannerImg4,
      onClick: () => {
        if (!modalWalletIsOpen) {
          openWalletModal();
          onClick?.();
        }
      },
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.pagination} role="tablist">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(styles.dot, activeIndex === index ? styles.activeDote : '')}
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`${t('banner.pagination.slide')} ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.slider} data-no-modal-swipe="true">
      <Swiper
        modules={[Autoplay, FreeMode]}
        loop={true}
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: true,
        }}
        freeMode={{
          enabled: true,
          momentum: true,
          sticky: true,
          momentumRatio: 0.7,
          momentumVelocityRatio: 0.8,
        }}
        onSlideChange={handleSlideChange}
        className={styles.slotViewport}
        slidesPerView={1}
        spaceBetween={16}
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id} className={styles.bannerSlide}>
            <div className={styles.bannerSlideWrapper} onClick={slide.onClick}>
              <div>
                <h3 className={styles.bannerTitle}>{t(slide.titleKey)}</h3>
                <h3 className={styles.bannerTitle}>{t(slide.secondTitleKey)}</h3>
              </div>

              <div className={styles.bannerImg}>
                <img draggable={false} src={slide.url} alt={`${t(slide.titleKey)} ${t(slide.secondTitleKey)}`} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {slides.length > 1 && renderCustomPagination()}
    </div>
  );
};
