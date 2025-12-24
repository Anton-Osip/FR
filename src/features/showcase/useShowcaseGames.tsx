import { useCallback, useEffect, useRef, useState } from 'react';

import { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@shared/schemas';

import { getShowcaseGames } from './api.ts';

interface UseShowcaseGamesReturn {
  data: ShowcaseGamesResponse | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useShowcaseGames = (params?: GetShowcaseGamesParams): UseShowcaseGamesReturn => {
  const [data, setData] = useState<ShowcaseGamesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  const fetchGames = useCallback(
    async (append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getShowcaseGames(params);

      if (result.ok && result.data) {
        if (append) {
          setData(prevData => {
            if (!prevData) return result.data!;

            return {
              ...result.data!,
              items: [...prevData.items, ...result.data!.items],
            };
          });
        } else {
          setData(result.data);
        }
      } else {
        setError(result.error || 'Ошибка загрузки игр');
      }

      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    },
    [params],
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMoreRef.current) return Promise.resolve();

    return new Promise<void>(resolve => {
      setData(currentData => {
        if (!currentData?.meta.has_more || isLoadingMoreRef.current) {
          resolve();

          return currentData;
        }

        isLoadingMoreRef.current = true;
        const nextParams = {
          ...params,
          cursor: currentData.meta.next_cursor,
        };

        setLoadingMore(true);

        // Выполняем загрузку асинхронно, не блокируя основной поток
        // Используем микротаск для неблокирующего выполнения
        Promise.resolve()
          .then(() => {
            return getShowcaseGames(nextParams);
          })
          .then(result => {
            if (result.ok && result.data) {
              // Обновляем данные напрямую, без дополнительных задержек
              setData(prevData => {
                if (!prevData) return result.data!;

                return {
                  ...result.data!,
                  items: [...prevData.items, ...result.data!.items],
                };
              });
            }
            setLoadingMore(false);
            isLoadingMoreRef.current = false;
            resolve();
          })
          .catch(() => {
            setLoadingMore(false);
            isLoadingMoreRef.current = false;
            resolve();
          });

        return currentData;
      });
    });
  }, [params]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      fetchGames(false);
    });
  }, [fetchGames]);

  return { data, loading, loadingMore, error, refetch: () => fetchGames(false), loadMore };
};
