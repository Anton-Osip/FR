import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import { Button } from '@shared/ui';

import styles from './AdaptiveSection.module.scss';

export interface AdaptiveSectionProps<T> {
  className?: string;
  title: ReactNode;
  data: T[];
  renderItem: (item: T) => ReactElement;
  getItemKey?: (item: T, index: number) => string | number;
  breakpoint?: number;
  gridClassName?: string;
  sliderClassName?: string;
  swiperSlideClassName?: string;
  swiperBreakpoints?: Record<number, { spaceBetween?: number }>;
}

const DEFAULT_BREAKPOINT = 1510;
const NAVIGATION_UPDATE_DELAY_MS = 100;
const DEFAULT_SPACE_BETWEEN = 8;

export const AdaptiveSection = <T,>({
  className,
  title,
  data,
  renderItem,
  getItemKey = (item: T, index: number) => {
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return (item as { id: string | number }).id;
    }

    return index;
  },
  breakpoint = DEFAULT_BREAKPOINT,
  gridClassName,
  sliderClassName,
  swiperSlideClassName,
  swiperBreakpoints,
}: AdaptiveSectionProps<T>): ReactElement => {
  const [isSliderMode, setIsSliderMode] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const updateNavigation = useCallback((): void => {
    if (swiperRef.current) {
      requestAnimationFrame(() => {
        if (swiperRef.current) {
          setCanScrollPrev(!swiperRef.current.isBeginning);
          setCanScrollNext(!swiperRef.current.isEnd);
        }
      });
    }
  }, []);

  useEffect(() => {
    const checkScreenWidth = (): void => {
      setIsSliderMode(window.innerWidth < breakpoint);
      setSliderKey(prev => prev + 1);
    };

    checkScreenWidth();

    let resizeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = (): void => {
      checkScreenWidth();
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = setTimeout(() => {
        updateNavigation();
        resizeTimeoutId = null;
      }, NAVIGATION_UPDATE_DELAY_MS);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
    };
  }, [breakpoint, updateNavigation]);

  const handlePrev = useCallback((): void => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback((): void => {
    swiperRef.current?.slideNext();
  }, []);

  const renderGrid = (): ReactElement => (
    <div className={clsx(styles.grid, gridClassName)}>
      {data.map((item, index) => (
        <div key={getItemKey(item, index)}>{renderItem(item)}</div>
      ))}
    </div>
  );

  const renderSlider = (): ReactElement => (
    <div key={sliderKey} className={clsx(styles.carousel, sliderClassName)}>
      <div className={styles.carouselHeaderButtons}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.carouselHeaderControls}>
          <Button
            variant="secondary"
            square
            icon={ChevronLeftIcon}
            className={styles.carouselButton}
            onClick={handlePrev}
            disabled={!canScrollPrev}
          />
          <Button
            variant="secondary"
            square
            icon={ChevronRightIcon}
            className={styles.carouselButton}
            onClick={handleNext}
            disabled={!canScrollNext}
          />
        </div>
      </div>
      {!canScrollNext && <div className={clsx(styles.shadow, styles.shadowLeft)} />}
      {canScrollNext && <div className={clsx(styles.shadow, styles.shadowRight)} />}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={DEFAULT_SPACE_BETWEEN}
        slidesPerView="auto"
        centeredSlides={false}
        pagination={{ clickable: true }}
        watchOverflow
        onSwiper={swiper => {
          swiperRef.current = swiper;
          updateNavigation();
        }}
        onSlideChange={updateNavigation}
        onUpdate={updateNavigation}
        onResize={updateNavigation}
        onReachBeginning={() => {
          updateNavigation();
        }}
        onReachEnd={() => {
          updateNavigation();
        }}
        onFromEdge={() => {
          updateNavigation();
        }}
        className={styles.swiper}
        breakpoints={swiperBreakpoints || { 864: { spaceBetween: 16 } }}
      >
        {data.map((item, index) => (
          <SwiperSlide key={getItemKey(item, index)} className={clsx(styles.swiperSlide, swiperSlideClassName)}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <section className={clsx(styles.wrapper, className)}>
      {isSliderMode ? (
        renderSlider()
      ) : (
        <>
          <div className={styles.title}>{title}</div>
          {renderGrid()}
        </>
      )}
    </section>
  );
};
