import { useEffect, useRef, type RefObject } from 'react';

const DEFAULT_THRESHOLD = 0.1;

interface UseInfiniteScrollOptions {
  /**
   * Callback функция, вызываемая при достижении триггера
   */
  onLoadMore: () => void;
  /**
   * Флаг, указывающий есть ли еще данные для загрузки
   */
  hasMore: boolean;
  /**
   * Флаг, указывающий идет ли загрузка в данный момент
   */
  isLoading: boolean;
  /**
   * Отступ от края для срабатывания загрузки (по умолчанию '100px')
   */
  rootMargin?: string;
  /**
   * Порог видимости элемента для срабатывания (от 0 до 1, по умолчанию 0.1)
   */
  threshold?: number;
  /**
   * Контейнер для скролла (по умолчанию viewport)
   */
  root?: HTMLElement | null;
}

/**
 * Хук для реализации бесконечной прокрутки с использованием Intersection Observer API
 * @param options - Опции для настройки поведения
 * @returns ref для элемента-триггера
 */
const DEFAULT_ROOT_MARGIN = '150px';

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
  root = null,
}: UseInfiniteScrollOptions): RefObject<HTMLDivElement | null> => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    const currentObserverRef = observerRef.current;

    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [onLoadMore, hasMore, isLoading, root, rootMargin, threshold]);

  return observerRef;
};
