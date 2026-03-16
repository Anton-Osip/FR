import { type FC, memo, type SVGProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';

import { selectDeviceType, selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { Button } from '@shared/ui';

import 'swiper/css';
import 'swiper/css/free-mode';

import { CarouselItem, CarouselItemSkeleton } from '@widgets/carouselItem';

import styles from './Carousel.module.scss';
import { useCarousel } from './useCarousel';

import type { GameKind } from '@/entities/game';
import type { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@/features/showcase';
import { SLOTS_PAGE_SIZE, useGetShowcaseGamesQuery, useLazyGetShowcaseGamesQuery } from '@/features/showcase';
import { useCountryIsBlocked } from '@entities/user';

const REINIT_DELAY_MS = 100;
const CHECK_REINIT_DELAY_MS = 100;

const BASE_BREAKPOINTS = {
  641: { slidesPerView: 6, spaceBetween: 8 },
} satisfies SwiperOptions['breakpoints'];

const DEFAULT_BREAKPOINTS = {
  ...BASE_BREAKPOINTS,
  864: { slidesPerView: 7, spaceBetween: 16 },
} satisfies SwiperOptions['breakpoints'];

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: 'popular' | 'history' | 'new' | GameKind;
}

const ITEMS_TO_ROUTE_TYPE: Record<Props['items'], string> = {
  popular: 'popularGames',
  live: 'liveGames',
  fast: 'quickGames',
  slot: 'slots',
  history: 'historyGames',
  blackjack: 'blackjackGames',
  roulette: 'rouletteGames',
  baccarat: 'baccaratGames',
  new: 'newGames',
  other: 'allGames',
} as const;

const CarouselComponent: FC<Props> = ({ title, icon: Icon, items }) => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { swiperRef, swiper, canScrollPrev, canScrollNext, scrollPrev, scrollNext, isNearEnd } = useCarousel();
  const deviceType = useAppSelector(selectDeviceType);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const options: GetShowcaseGamesParams = useMemo(
    () => ({
      page_size: SLOTS_PAGE_SIZE,
      only_popular: items === 'popular' || undefined,
      game_kinds: items !== 'new' && items !== 'popular' && items !== 'history' ? [items] : undefined,
      sort: 'popular',
      sort_dir: 'asc',
      only_new: items === 'new',
      only_mobile: deviceType === 'mobile',
      only_history: items === 'history',
      include_blocked_regions: true,
    }),
    [deviceType, items],
  );

  const { data: initialData, isLoading } = useGetShowcaseGamesQuery(options, {
    skip: items === 'history' && !isLoggedIn,
  });
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();
  const countryIsBlocked = useCountryIsBlocked();
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

    if (items.length === 0 && !isLoading) {
      return Array.from({ length: 7 }).map((_, index) => ({ id: `empty-${index}`, type: 'empty' as const }));
    }

    return items.map(item => ({
      id: item.id,
      type: 'item' as const,
      img: item.image,
      link: APP_PATH.slot.replace(':id', String(item.uuid)),
      is_favorite: item.is_favorite,
      blocked_countries: countryIsBlocked(item.blocked_countries),
      name: item.name,
    }));
  }, [isLoading, accumulatedData, countryIsBlocked]);

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

  const handleAllButtonClick = useCallback((): void => {
    const type = ITEMS_TO_ROUTE_TYPE[items] || 'allGames';

    navigate(APP_PATH.slots.replace(':type', type));
  }, [items, navigate]);

  if (items === 'history' && (!isLoggedIn || (initialData?.items && initialData.items.length <= 0 && !isLoading))) {
    return null;
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselHeader}>
        <div className={styles.carouselTitle}>
          <Icon />
          <h3>{title}</h3>
        </div>
        <div className={styles.carouselHeaderButtons}>
          {items !== 'history' && (
            <Button variant="secondary" size="s" className={styles.carouselButton} onClick={handleAllButtonClick}>
              {t('carousel.all')}
            </Button>
          )}

          <div className={styles.carouselHeaderControls}>
            <Button
              variant="secondary"
              square
              icon={ChevronLeftIcon}
              onClick={scrollPrev}
              disabled={!canScrollPrev || !hasSlides}
              className={styles.carouselButton}
              aria-label={t('carousel.previous')}
            />
            <Button
              variant="secondary"
              square
              icon={ChevronRightIcon}
              onClick={scrollNext}
              disabled={!canScrollNext || !hasSlides}
              className={styles.carouselButton}
              aria-label={t('carousel.next')}
            />
          </div>
        </div>
      </div>

      <div className={styles.viewport}>
        <Swiper
          modules={[FreeMode, Navigation]}
          spaceBetween={8}
          slidesPerView={3}
          breakpoints={DEFAULT_BREAKPOINTS}
          freeMode={{
            enabled: true,
            momentum: true,
            sticky: true,
            momentumRatio: 0.7,
            momentumVelocityRatio: 0.8,
          }}
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
                <CarouselItem data={slideData} />
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
