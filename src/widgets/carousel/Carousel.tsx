import { type FC, memo, type SVGProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { Button } from '@shared/ui';

import 'swiper/css';

import styles from './Carousel.module.scss';
import { CarouselItem } from './CarouselItem/CarouselItem';
import { CarouselItemSkeleton } from './CarouselItem/CarouselItemSkeleton';
import { useCarousel } from './useCarousel';

import type { GameKind } from '@/entities/game';
import type { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@/features/showcase';
import { useGetShowcaseGamesQuery, useLazyGetShowcaseGamesQuery } from '@/features/showcase';

const REINIT_DELAY_MS = 100;
const CHECK_REINIT_DELAY_MS = 100;

const BASE_BREAKPOINTS = {
  641: { slidesPerView: 6, spaceBetween: 8 },
} satisfies SwiperOptions['breakpoints'];

const POPULAR_BREAKPOINTS = {
  ...BASE_BREAKPOINTS,
  786: { slidesPerView: 7, spaceBetween: 16 },
  864: { slidesPerView: 7, spaceBetween: 16 },
} satisfies SwiperOptions['breakpoints'];

const DEFAULT_BREAKPOINTS = {
  ...BASE_BREAKPOINTS,
  864: { slidesPerView: 7, spaceBetween: 16 },
} satisfies SwiperOptions['breakpoints'];

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: 'popular' | GameKind;
  isPopular: boolean;
}

const CarouselComponent: FC<Props> = ({ title, icon: Icon, items, isPopular }) => {
  const { t } = useTranslation('home');
  const { swiperRef, swiper, canScrollPrev, canScrollNext, scrollPrev, scrollNext, isNearEnd } = useCarousel();
  const deviceType = useAppSelector(selectDeviceType);

  const options: GetShowcaseGamesParams = useMemo(
    () => ({
      page_size: 30,
      only_popular: items === 'popular' || undefined,
      game_kinds: items !== 'popular' ? [items] : undefined,
      sort: 'popular',
      sort_dir: 'asc',
      only_mobile: deviceType === 'mobile',
    }),
    [deviceType, items],
  );

  const { data: initialData, isLoading } = useGetShowcaseGamesQuery(options);
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();

  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const isLoadingMoreRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousItemsCountRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialData) {
      setAccumulatedData(initialData);
    }
  }, [initialData]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!accumulatedData?.meta.has_more || isLoadingMore || isLoadingMoreRef.current) {
      return;
    }

    isLoadingMoreRef.current = true;

    try {
      const nextParams: GetShowcaseGamesParams = {
        ...options,
        cursor: accumulatedData.meta.next_cursor,
      };

      const result = await loadMoreQuery(nextParams).unwrap();

      setAccumulatedData(prevData => {
        if (!prevData) return result;

        return {
          ...result,
          items: [...prevData.items, ...result.items],
          meta: {
            ...result.meta,
            total: prevData.meta.total,
          },
        };
      });

      if (swiper) {
        requestAnimationFrame(() => {
          if (swiper) {
            swiper.update();
            swiper.updateSlides();
          }
        });
      }
    } catch {
      // Ошибка обрабатывается через error state
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [accumulatedData, isLoadingMore, loadMoreQuery, options, swiper]);

  const slidesData = useMemo(() => {
    if (isLoading && !accumulatedData) {
      return Array.from({ length: 7 }).map((_, index) => ({ id: `skeleton-${index}`, type: 'skeleton' as const }));
    }

    const items = accumulatedData?.items || [];

    // Если данных нет, показываем пустые блоки
    if (items.length === 0 && !isLoading) {
      return Array.from({ length: 7 }).map((_, index) => ({ id: `empty-${index}`, type: 'empty' as const }));
    }

    return items.map(item => ({ id: item.id, type: 'item' as const, img: item.image, link: item.slug }));
  }, [isLoading, accumulatedData]);

  const hasSlides = useMemo(() => slidesData.length > 0, [slidesData]);

  useEffect(() => {
    if (!swiper) return;

    const handleSlideChange = (): void => {
      isScrollingRef.current = true;
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
      requestAnimationFrame(() => {
        scrollEndTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 200);
      });
    };

    swiper.on('slideChange', handleSlideChange);
    swiper.on('transitionEnd', handleSlideChange);

    return () => {
      swiper.off('slideChange', handleSlideChange);
      swiper.off('transitionEnd', handleSlideChange);
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [swiper]);

  useEffect(() => {
    if (!swiper || isLoading || hasInitializedRef.current) return;

    if (accumulatedData && accumulatedData.items.length > 0) {
      const updateSwiper = (): void => {
        if (swiper) {
          swiper.update();
          swiper.updateSize();
          swiper.updateSlides();
          swiper.slideTo(0, 0);
          hasInitializedRef.current = true;
          previousItemsCountRef.current = accumulatedData.items.length;
        }
      };

      requestAnimationFrame(() => {
        setTimeout(updateSwiper, 0);
      });
    }
  }, [swiper, accumulatedData, isLoading]);

  useEffect(() => {
    if (!swiper || isLoading || !hasInitializedRef.current) return;

    const currentItemsCount = accumulatedData?.items.length || 0;
    const previousItemsCount = previousItemsCountRef.current;

    if (currentItemsCount > previousItemsCount && previousItemsCount > 0) {
      const checkAndUpdate = (): void => {
        if (!isScrollingRef.current && swiper) {
          const currentSlideCount = swiper.slides.length;

          if (currentSlideCount < currentItemsCount) {
            if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
              window.requestIdleCallback(
                () => {
                  if (swiper && !isScrollingRef.current) {
                    swiper.update();
                  }
                },
                { timeout: 1000 },
              );
            } else {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  if (swiper && !isScrollingRef.current) {
                    swiper.update();
                  }
                }, REINIT_DELAY_MS);
              });
            }
          }
          previousItemsCountRef.current = currentItemsCount;
        } else {
          setTimeout(checkAndUpdate, 200);
        }
      };

      requestAnimationFrame(() => {
        setTimeout(checkAndUpdate, CHECK_REINIT_DELAY_MS);
      });
    } else {
      previousItemsCountRef.current = currentItemsCount;
    }
  }, [swiper, accumulatedData?.items.length, isLoading, isLoadingMore]);

  useEffect(() => {
    if (isNearEnd && !isLoadingMore && !isLoadingMoreRef.current && accumulatedData?.meta.has_more) {
      const timeoutId = setTimeout(() => {
        void loadMore();
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isNearEnd, isLoadingMore, accumulatedData?.meta.has_more, loadMore]);

  useEffect(() => {
    if (!swiper) return;

    const handleResize = (): void => {
      if (swiper) {
        swiper.updateSize();
        swiper.update();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [swiper]);

  const breakpointsOption = useMemo(() => (isPopular ? POPULAR_BREAKPOINTS : DEFAULT_BREAKPOINTS), [isPopular]);

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselHeader}>
        <div className={styles.carouselTitle}>
          <Icon />
          <h3>{title}</h3>
        </div>
        <div className={styles.carouselHeaderButtons}>
          <Button variant="secondary" size="s" className={styles.carouselButton}>
            {t('carousel.all')}
          </Button>
          <div className={styles.carouselHeaderControls}>
            <Button
              variant="secondary"
              square
              icon={ChevronLeftIcon}
              onClick={scrollPrev}
              disabled={!canScrollPrev || !hasSlides}
              className={styles.carouselButton}
            />
            <Button
              variant="secondary"
              square
              icon={ChevronRightIcon}
              onClick={scrollNext}
              disabled={!canScrollNext || !hasSlides}
              className={styles.carouselButton}
            />
          </div>
        </div>
      </div>

      <div className={styles.viewport}>
        <Swiper
          modules={[Navigation]}
          spaceBetween={8}
          slidesPerView={3}
          breakpoints={breakpointsOption}
          watchOverflow
          allowTouchMove={hasSlides}
          allowSlideNext={hasSlides}
          allowSlidePrev={hasSlides}
          onSwiper={swiperRef}
          className={styles.swiperContainer}
        >
          {slidesData.map(slideData => (
            <SwiperSlide key={slideData.id} className={styles.swiperSlide}>
              {slideData.type === 'skeleton' ? (
                <CarouselItemSkeleton />
              ) : slideData.type === 'empty' ? (
                <div className={styles.emptyItem} />
              ) : (
                <CarouselItem img={slideData.img} link={slideData.link} isPopular={isPopular} />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export const Carousel = memo(CarouselComponent);

Carousel.displayName = 'Carousel';
