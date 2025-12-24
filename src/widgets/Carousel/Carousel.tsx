import { type FC, memo, type SVGProps, useEffect, useMemo, useRef } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

import { GetShowcaseGamesParams } from '@shared/schemas';
import { Button } from '@shared/ui/button';

import styles from './Carousel.module.scss';
import { CarouselItem } from './CarouselItem/CarouselItem';
import { CarouselItemSkeleton } from './CarouselItem/CarouselItemSkeleton';
import { useCarousel } from './useCarousel';

import { useShowcaseGames } from '@/features/showcase';

const REINIT_DELAY_MS = 100;
const CHECK_REINIT_DELAY_MS = 100;

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: 'popular' | 'slot' | 'live' | 'fast';
}

const CarouselComponent: FC<Props> = ({ title, icon: Icon, items }) => {
  const { t } = useTranslation('home');
  const { emblaRef, emblaApi, canScrollPrev, canScrollNext, scrollPrev, scrollNext, isNearEnd } = useCarousel();

  const options: GetShowcaseGamesParams = {
    page_size: 30,
    only_popular: items === 'popular' || undefined,
    game_kinds: items !== 'popular' ? [items] : undefined,
    sort: 'popular',
    sort_dir: 'asc',
  };

  const { data, loading, loadingMore, loadMore } = useShowcaseGames(options);
  const isLoadingMoreRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousItemsCountRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = useMemo(() => {
    if (loading) {
      return Array.from({ length: 7 }).map((_, index) => <CarouselItemSkeleton key={`skeleton-${index}`} />);
    }

    return data?.items.map(item => <CarouselItem key={item.id} img={item.image} link={item.slug} />) || [];
  }, [data?.items, loading]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleScroll = (): void => {
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

    emblaApi.on('scroll', handleScroll);
    emblaApi.on('select', handleScroll);

    return () => {
      emblaApi.off('scroll', handleScroll);
      emblaApi.off('select', handleScroll);
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || loading || hasInitializedRef.current) return;

    if (data && data.items.length > 0) {
      requestAnimationFrame(() => {
        if (emblaApi) {
          emblaApi.reInit();
          hasInitializedRef.current = true;
          previousItemsCountRef.current = data.items.length;
        }
      });
    }
  }, [emblaApi, data, loading]);

  useEffect(() => {
    if (!emblaApi || loading || !hasInitializedRef.current) return;

    const currentItemsCount = data?.items.length || 0;
    const previousItemsCount = previousItemsCountRef.current;

    if (currentItemsCount > previousItemsCount && previousItemsCount > 0) {
      const checkAndReinit = (): void => {
        if (!isScrollingRef.current && emblaApi) {
          const currentSlideCount = emblaApi.slideNodes().length;

          if (currentSlideCount < currentItemsCount) {
            if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
              window.requestIdleCallback(
                () => {
                  if (emblaApi && !isScrollingRef.current) {
                    emblaApi.reInit();
                  }
                },
                { timeout: 1000 },
              );
            } else {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  if (emblaApi && !isScrollingRef.current) {
                    emblaApi.reInit();
                  }
                }, REINIT_DELAY_MS);
              });
            }
          }
          previousItemsCountRef.current = currentItemsCount;
        } else {
          setTimeout(checkAndReinit, 200);
        }
      };

      requestAnimationFrame(() => {
        setTimeout(checkAndReinit, CHECK_REINIT_DELAY_MS);
      });
    } else {
      previousItemsCountRef.current = currentItemsCount;
    }
  }, [emblaApi, data?.items.length, loading, loadingMore]);

  useEffect(() => {
    if (isNearEnd && !loadingMore && !isLoadingMoreRef.current && data?.meta.has_more) {
      isLoadingMoreRef.current = true;
      const timeoutId = setTimeout(() => {
        loadMore().finally(() => {
          isLoadingMoreRef.current = false;
        });
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isNearEnd, loadingMore, data?.meta.has_more, loadMore]);

  return (
    <div className={styles.carousel}>
      <div className={styles['carousel-header']}>
        <div className={styles['carousel-title']}>
          <Icon />
          <h3>{title}</h3>
        </div>
        <div className={styles['carousel-header-buttons']}>
          <Button variant="secondary" size="s" className={styles['carousel-button']}>
            {t('carousel.all')}
          </Button>
          <div className={styles['carousel-header-controls']}>
            <Button
              variant="secondary"
              square
              icon={ChevronLeftIcon}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={styles['carousel-button']}
            />
            <Button
              variant="secondary"
              square
              icon={ChevronRightIcon}
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={styles['carousel-button']}
            />
          </div>
        </div>
      </div>

      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles['carousel-flexbox']}>{slides}</div>
      </div>
    </div>
  );
};

export const Carousel = memo(CarouselComponent);

Carousel.displayName = 'Carousel';
