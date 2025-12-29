import { FC, type ReactElement, ReactNode, useState } from 'react';

import type SwiperType from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { LOGIN_ORIGIN } from '@shared/config/constants.ts';
import { Button, Input, Modal } from '@shared/ui';
import { LockIcon, MailIcon, TgIcon } from '@shared/ui/icons';

import styles from './LoginModal.module.scss';

export interface LoginModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SLIDES_COUNT = 4;
const FIRST_SLIDE = 1;
const SECOND_SLIDE = 2;
const THIRD_SLIDE = 3;
const SLIDE_INDICES = [FIRST_SLIDE, SECOND_SLIDE, THIRD_SLIDE, SLIDES_COUNT];

export const LoginModal: FC<LoginModalProps> = ({ trigger, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const slides = SLIDE_INDICES;
  const [activeIndex, setActiveIndex] = useState(0);

  // Используем управляемый режим, если передан open, иначе используем внутреннее состояние
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = (newOpen: boolean): void => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleSlideChange = (swiper: SwiperType): void => {
    setActiveIndex(swiper.realIndex);
  };

  const renderCustomPagination = (): ReactElement => {
    return (
      <div className={styles.cashbackPagination}>
        {slides.map((idx, index) => (
          <div key={idx} className={`${styles.cashbackDot} ${activeIndex === index ? styles.activeDote : ''}`} />
        ))}
      </div>
    );
  };

  const goToLogin = (): void => {
    if (typeof window === 'undefined') return;
    const u = new URL(LOGIN_ORIGIN);

    u.pathname = '/';
    u.searchParams.set('return_to', window.location.href);
    window.location.assign(u.toString());
  };

  return (
    <Modal
      trigger={trigger}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
    >
      <div className={styles.body}>
        <div className={styles.slider}>
          <Swiper
            modules={[Autoplay]}
            loop={true}
            speed={800}
            onSlideChange={handleSlideChange}
            className={styles.bannerSwiper}
            slidesPerView={1}
            spaceBetween={16}
          >
            {slides.map(slide => (
              <SwiperSlide key={slide} className={styles.bannerSlide}>
                <div className={styles.bannerSlideWrapper}>
                  <h3 className={styles.bannerTitle}>+5% на первый крипто-депозит</h3>

                  <div className={styles.bannerImg}></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {renderCustomPagination()}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>Войти</h3>
          <form className={styles.form}>
            <Input icon={<MailIcon />} placeholder={'Email'} />
            <Input icon={<LockIcon />} placeholder={'Пароль'} />
            <Button variant={'ghost'} className={styles.recover}>
              Восстановить пароль
            </Button>
            <Button type={'button'} variant={'primary'} fullWidth={true}>
              Войти
            </Button>
          </form>
        </div>
        <footer className={styles.footer}>
          <div className={styles.lines}>
            <div className={styles.line} />
            <h3 className={styles.footerTitle}>Или войдите через</h3>
            <div className={styles.line} />
          </div>
          <div className={styles.lines}>
            <Button variant={'ghost'} className={styles.tgIcon} onClick={() => goToLogin()}>
              <TgIcon />
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};
