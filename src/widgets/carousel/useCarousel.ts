import { useCallback, useEffect, useRef, useState } from 'react';

import type { Swiper as SwiperType } from 'swiper';

const NEAR_END_THRESHOLD = 7;
const CHECK_NEAR_END_DEBOUNCE_MS = 50;

interface UseCarouselReturn {
  swiperRef: (swiper: SwiperType | null) => void;
  swiper: SwiperType | null;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  isNearEnd: boolean;
}

export const useCarousel = (): UseCarouselReturn => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false);
  const [canScrollNext, setCanScrollNext] = useState<boolean>(false);
  const [isNearEnd, setIsNearEnd] = useState(false);

  const swiperRef = useCallback((swiperInstance: SwiperType | null) => {
    setSwiper(swiperInstance);
  }, []);

  const scrollPrev = useCallback(() => {
    if (!swiper) return;
    const currentIndex = swiper.activeIndex;
    const slidesPerView = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
    const targetIndex = Math.max(0, currentIndex - slidesPerView);

    swiper.slideTo(targetIndex);
  }, [swiper]);

  const scrollNext = useCallback(() => {
    if (!swiper) return;
    const currentIndex = swiper.activeIndex;
    const slidesPerView = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
    const totalSlides = swiper.slides.length;
    const targetIndex = Math.min(totalSlides - 1, currentIndex + slidesPerView);

    swiper.slideTo(targetIndex);
  }, [swiper]);

  const updateButtons = useCallback(() => {
    if (!swiper) return;

    requestAnimationFrame(() => {
      setCanScrollPrev(!swiper.isBeginning);
      setCanScrollNext(!swiper.isEnd);
    });
  }, [swiper]);

  useEffect(() => {
    if (!swiper) return;

    updateButtons();
    swiper.on('slideChange', updateButtons);
    swiper.on('update', updateButtons);

    return () => {
      swiper.off('slideChange', updateButtons);
      swiper.off('update', updateButtons);
    };
  }, [swiper, updateButtons]);

  const hasScrolledRef = useRef(false);
  const checkNearEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!swiper) return;

    const checkNearEnd = (): void => {
      if (checkNearEndTimeoutRef.current) {
        clearTimeout(checkNearEndTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        checkNearEndTimeoutRef.current = setTimeout(() => {
          const currentIndex = swiper.activeIndex;
          const slidesPerView = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
          const totalSlides = swiper.slides.length;
          const remainingSlides = totalSlides - (currentIndex + slidesPerView);

          if (currentIndex > 0) {
            hasScrolledRef.current = true;
          }

          setIsNearEnd(hasScrolledRef.current && remainingSlides <= NEAR_END_THRESHOLD);
          checkNearEndTimeoutRef.current = null;
        }, CHECK_NEAR_END_DEBOUNCE_MS);
      });
    };

    checkNearEnd();
    swiper.on('slideChange', checkNearEnd);
    swiper.on('update', checkNearEnd);

    return () => {
      swiper.off('slideChange', checkNearEnd);
      swiper.off('update', checkNearEnd);
      if (checkNearEndTimeoutRef.current) {
        clearTimeout(checkNearEndTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [swiper]);

  return {
    swiperRef,
    swiper,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    isNearEnd,
  };
};
