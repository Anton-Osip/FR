import { useEffect, useRef, useState } from 'react';

/**
 * Хук для проверки медиа-запроса
 * @param query - CSS медиа-запрос (например, '(min-width: 768px)')
 * @returns true, если медиа-запрос соответствует текущему размеру экрана
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  const queryRef = useRef<string>(query);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const currentMatches = mediaQuery.matches;

    if (queryRef.current !== query) {
      queryRef.current = query;
      requestAnimationFrame(() => {
        setMatches(currentMatches);
      });
    }

    const handler = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);

      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }

    mediaQuery.addListener(handler);

    return () => {
      mediaQuery.removeListener(handler);
    };
  }, [query]);

  return matches;
}
