import { useCallback, useEffect, useRef, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

const NEAR_END_THRESHOLD = 7;
const CHECK_NEAR_END_DEBOUNCE_MS = 50;

interface UseCarouselReturn {
  emblaRef: (node: HTMLElement | null) => void;
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  isNearEnd: boolean;
}

export const useCarousel = (): UseCarouselReturn => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false);
  const [canScrollNext, setCanScrollNext] = useState<boolean>(false);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;

    const currentIndex = emblaApi.selectedScrollSnap();
    const visibleSlides = emblaApi.slidesInView().length;
    const targetIndex = Math.max(0, currentIndex - visibleSlides);

    emblaApi.scrollTo(targetIndex);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;

    const currentIndex = emblaApi.selectedScrollSnap();
    const visibleSlides = emblaApi.slidesInView().length;
    const totalSlides = emblaApi.slideNodes().length;
    const targetIndex = Math.min(totalSlides - 1, currentIndex + visibleSlides);

    emblaApi.scrollTo(targetIndex);
  }, [emblaApi]);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;

    requestAnimationFrame(() => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();
    emblaApi.on('select', updateButtons);
    emblaApi.on('reInit', updateButtons);

    return () => {
      emblaApi.off('select', updateButtons);
      emblaApi.off('reInit', updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const [isNearEnd, setIsNearEnd] = useState(false);
  const hasScrolledRef = useRef(false);
  const checkNearEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const checkNearEnd = (): void => {
      if (checkNearEndTimeoutRef.current) {
        clearTimeout(checkNearEndTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        checkNearEndTimeoutRef.current = setTimeout(() => {
          const slides = emblaApi.slideNodes();
          const selectedIndex = emblaApi.selectedScrollSnap();
          const totalSlides = slides.length;
          const visibleSlides = emblaApi.slidesInView().length;
          const remainingSlides = totalSlides - (selectedIndex + visibleSlides);

          if (selectedIndex > 0) {
            hasScrolledRef.current = true;
          }

          setIsNearEnd(hasScrolledRef.current && remainingSlides <= NEAR_END_THRESHOLD);
          checkNearEndTimeoutRef.current = null;
        }, CHECK_NEAR_END_DEBOUNCE_MS);
      });
    };

    checkNearEnd();
    emblaApi.on('select', checkNearEnd);
    emblaApi.on('reInit', checkNearEnd);

    return () => {
      emblaApi.off('select', checkNearEnd);
      emblaApi.off('reInit', checkNearEnd);
      if (checkNearEndTimeoutRef.current) {
        clearTimeout(checkNearEndTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [emblaApi]);

  return {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    isNearEnd,
  };
};
