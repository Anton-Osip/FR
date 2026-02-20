import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { useDebounce } from '@shared/lib';
import { LoadMoreFooter } from '@shared/ui';

import { Carousel } from '@widgets/carousel';
import { CategoryFiltersBar } from '@widgets/categoryFiltersBar';
import { SlotsGrid } from '@widgets/slotsSection/ui/SlotsGrid/SlotsGrid.tsx';

import { getCarouselData, getCategoryTabs } from './constants';
import styles from './MainCarouselSection.module.scss';

import { useCountryIsBlocked } from '@entities/user';
import {
  GetShowcaseGamesParams,
  type ShowcaseGamesResponse,
  MIN_TOTAL_TO_SHOW_LOAD_MORE,
  SLOTS_PAGE_SIZE,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
} from '@features/showcase';

interface MainCarouselSectionProps {
  className?: string;
}

export type ActiveTab = 'popular' | 'slot' | 'live' | 'fast' | 'all';

const SEARCH_DEBOUNCE_MS = 500;

export const MainCarouselSection: FC<MainCarouselSectionProps> = ({ className }) => {
  const { t } = useTranslation('home');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const carouselData = useMemo(() => getCarouselData(t), [t]);
  const tabs = useMemo(() => getCategoryTabs(t, activeTab), [t, activeTab]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);
  const countryIsBlocked = useCountryIsBlocked();
  const deviceType = useAppSelector(selectDeviceType);

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    return {
      page_size: SLOTS_PAGE_SIZE,
      sort_dir: 'asc',
      only_mobile: deviceType === 'mobile',
      only_popular: activeTab === 'popular',
      game_kinds:
        activeTab === 'slot' ? ['slot'] : activeTab === 'fast' ? ['fast'] : activeTab === 'live' ? ['live'] : undefined,
      include_blocked_regions: true,
      search_query: debouncedSearchValue.trim() || undefined,
    };
  }, [deviceType, activeTab, debouncedSearchValue]);

  const { data, isFetching } = useGetShowcaseGamesQuery(queryParams);
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();
  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const [isQueryParamsChanged, setIsQueryParamsChanged] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const previousQueryParamsRef = useRef<GetShowcaseGamesParams | undefined>(queryParams);

  useEffect(() => {
    const queryParamsChanged = JSON.stringify(previousQueryParamsRef.current) !== JSON.stringify(queryParams);

    if (queryParamsChanged) {
      setAccumulatedData(null);
      setIsLoadingMoreLocal(false);
      setIsQueryParamsChanged(true);
      isLoadingMoreRef.current = false;
      previousQueryParamsRef.current = queryParams;
    }
  }, [queryParams]);

  useEffect(() => {
    if (data && !queryParams?.cursor) {
      setAccumulatedData(data);
      setIsQueryParamsChanged(false);
    }
  }, [data, queryParams?.cursor]);

  const transformedItems = useMemo(() => {
    if (isQueryParamsChanged && isFetching) {
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
  }, [accumulatedData, data, countryIsBlocked, isQueryParamsChanged, isFetching]);

  const showSkeleton = (isQueryParamsChanged && isFetching) || (isFetching && transformedItems.length === 0);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    const currentData = accumulatedData || data;

    if (!currentData?.meta.has_more || isLoadingMore || isLoadingMoreRef.current || !queryParams) {
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
  }, [accumulatedData, data, isLoadingMore, loadMoreQuery, queryParams]);

  const hasMore = (accumulatedData || data)?.meta.has_more ?? false;
  const isButtonLoading = isLoadingMore || isLoadingMoreLocal;

  const handleTabChange = (value: string): void => {
    setActiveTab(value as ActiveTab);
  };
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <div className={clsx(className)}>
      <CategoryFiltersBar
        className={styles.categoryFiltersBar}
        tabs={tabs}
        onTabChange={handleTabChange}
        inputValue={searchValue}
        onChangeInputValue={handleSearchChange}
      />

      {activeTab === 'all' && !searchValue && (
        <div className={styles.caruseles}>
          {carouselData.map(item => (
            <Carousel key={item.id} icon={item.icon} title={item.title} items={item.id} />
          ))}
        </div>
      )}

      {(activeTab !== 'all' || searchValue) && (
        <>
          <SlotsGrid items={transformedItems} isLoading={showSkeleton} />
          {!showSkeleton && accumulatedData && accumulatedData.meta.total > MIN_TOTAL_TO_SHOW_LOAD_MORE && (
            <LoadMoreFooter
              shown={accumulatedData.items.length}
              total={accumulatedData.meta.total}
              hasMore={hasMore}
              isLoading={isButtonLoading}
              onLoadMore={handleLoadMore}
              shownLabel={t('buttons.shown')}
              ofLabel={t('buttons.of')}
              showMoreLabel={t('buttons.loadMore')}
              loadingSpinner={<div className={styles.spinner} />}
              className={styles.more}
            />
          )}
        </>
      )}
    </div>
  );
};
