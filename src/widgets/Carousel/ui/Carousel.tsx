import { type FC, type SVGProps, useCallback, useEffect, useState } from 'react';

import { ChevronRightIcon, ChevronLeftIcon } from '@radix-ui/react-icons';
import useEmblaCarousel from 'embla-carousel-react';

import { Button } from '@shared/ui/button';

import { CarouselItem } from '@widgets/Carousel/ui/CarouselItem/CarouselItem';

import styles from '../Carousel.module.scss';
import { type CarouselItemProps } from '../types/types';

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: CarouselItemProps[];
}

export const Carousel: FC<Props> = ({ title, icon: Icon, items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false);
  const [canScrollNext, setCanScrollNext] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

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

  const MOBILE_BREAKPOINT = 1200;

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.carousel}>
      <div className={styles['carousel-header']}>
        <div className={styles['carousel-title']}>
          <Icon />
          <h3>{title === 'Быстрые игры' && windowWidth <= MOBILE_BREAKPOINT ? 'Быстрые' : title}</h3>
        </div>
        <div className={styles['carousel-header-buttons']}>
          <Button variant="secondary" size="s" className={styles['carousel-button']}>
            Все
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
        <div className={styles['carousel-flexbox']}>
          {items.map(item => (
            <CarouselItem key={item.id} img={item.img} link={item.link} />
          ))}
        </div>
      </div>
    </div>
  );
};
