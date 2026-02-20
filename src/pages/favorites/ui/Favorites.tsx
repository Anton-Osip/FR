import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { selectDeviceType, selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { Breadcrumbs, LoadMoreFooter } from '@shared/ui';

import { SlotsGrid } from '@widgets/slotsSection/ui/SlotsGrid/SlotsGrid.tsx';

import styles from './Favorites.module.scss';

import { useCountryIsBlocked } from '@entities/user';
import {
  GetShowcaseGamesParams,
  MIN_TOTAL_TO_SHOW_LOAD_MORE,
  type ShowcaseGamesResponse,
  SLOTS_PAGE_SIZE,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
} from '@features/showcase';

export const Favorites: FC = () => {
  const { t: tBreadcrumbs } = useTranslation('breadcrumbs');
  const { t } = useTranslation('favorites');
  const { t: tSlots } = useTranslation('slots');
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const countryIsBlocked = useCountryIsBlocked();
  const deviceType = useAppSelector(selectDeviceType);

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    return {
      page_size: SLOTS_PAGE_SIZE,
      sort_dir: 'asc',
      only_mobile: deviceType === 'mobile',
      include_blocked_regions: true,
      only_favorites: true,
    };
  }, [deviceType]);

  const { data, isFetching } = useGetShowcaseGamesQuery(queryParams, { skip: !isLoggedIn });
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();
  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (data && !queryParams?.cursor) {
      setAccumulatedData(data);
    }
  }, [data, queryParams?.cursor]);

  const transformedItems = useMemo(() => {
    if (isFetching) {
      return [];
    }

    const itemsToTransform = accumulatedData?.items || data?.items || [];

    return itemsToTransform.map(item => ({
      id: item.id,
      type: 'item' as const,
      img: item.image,
      link: APP_PATH.slot.replace(':id', String(item.uuid)),
      is_favorite: item.is_favorite,
      blocked_countries: countryIsBlocked(item.blocked_countries),
      name: item.name,
    }));
  }, [accumulatedData, data, countryIsBlocked, isFetching]);

  const showSkeleton = isFetching || (isFetching && transformedItems.length === 0);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    const currentData = accumulatedData || data;

    if (
      !currentData?.meta.has_more ||
      isLoadingMore ||
      isLoadingMoreLocal ||
      isLoadingMoreRef.current ||
      !queryParams
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMoreLocal(true);

    try {
      const nextParams: GetShowcaseGamesParams = {
        ...queryParams,
        cursor: currentData.meta.next_cursor,
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
    } catch {
      // Ошибка обрабатывается через error state
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMoreLocal(false);
    }
  }, [accumulatedData, data, isLoadingMore, isLoadingMoreLocal, loadMoreQuery, queryParams]);

  const hasMore = (accumulatedData || data)?.meta.has_more ?? false;
  const isButtonLoading = isLoadingMore || isLoadingMoreLocal;

  const breadCrumbsItems = useMemo(() => [{ label: tBreadcrumbs('pages.favorites') }], [tBreadcrumbs]);

  return (
    <div className={styles.favorites}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <div className={styles.content}>
        <SlotsGrid
          items={transformedItems}
          isLoading={showSkeleton}
          emptyText={{
            title: t('empty.title'),
            description: t('empty.description'),
          }}
        />
        {!showSkeleton && accumulatedData && accumulatedData.meta.total > MIN_TOTAL_TO_SHOW_LOAD_MORE && (
          <LoadMoreFooter
            shown={accumulatedData.items.length}
            total={accumulatedData.meta.total}
            hasMore={hasMore}
            isLoading={isButtonLoading}
            onLoadMore={handleLoadMore}
            shownLabel={tSlots('buttons.shown')}
            ofLabel={tSlots('buttons.of')}
            showMoreLabel={tSlots('buttons.loadMore')}
            loadingSpinner={<div className={styles.spinner} />}
            className={styles.more}
          />
        )}
      </div>
    </div>
  );
};
