import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { useDebounce } from '@shared/lib';
import { DropdownApp, Input, LoadMoreFooter } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp.tsx';
import { SearchIcon } from '@shared/ui/icons';

import type { SlotsHeaderType } from '@widgets/slotsHeader/constants.ts';

import { usePopularOptions, useProviderOptions, useSlotsFilters } from '../models/useSlotsFilters';

import { SlotsGrid } from './SlotsGrid/SlotsGrid';
import styles from './SlotsSection.module.scss';

import { type GameKind } from '@entities/game';
import { useCountryIsBlocked } from '@entities/user';
import {
  type GetShowcaseGamesParams,
  type ShowcaseGamesResponse,
  type SortType,
  MIN_TOTAL_TO_SHOW_LOAD_MORE,
  SLOTS_PAGE_SIZE,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
} from '@features/showcase';

interface SlotsSectionProps {
  className?: string;
  type?: SlotsHeaderType;
}

const SEARCH_DEBOUNCE_MS = 500;

const TYPE_TO_GAME_KIND_MAP: Partial<Record<SlotsHeaderType, GameKind>> = {
  baccaratGames: 'baccarat',
  blackjackGames: 'blackjack',
  rouletteGames: 'roulette',
  quickGames: 'fast',
  liveGames: 'live',
  allGames: 'slot',
};

export const SlotsSection: FC<SlotsSectionProps> = ({ className, type }) => {
  const { t } = useTranslation('slots');
  const {
    providerFilter,
    popularFilter,
    searchValue,
    handleProviderChange,
    handlePopularChange,
    handleSearchChange,
    resetFilters,
  } = useSlotsFilters();
  const providerOptions = useProviderOptions();
  const popularOptions = usePopularOptions();

  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);
  const countryIsBlocked = useCountryIsBlocked();
  const deviceType = useAppSelector(selectDeviceType);

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    const gameKind = type ? TYPE_TO_GAME_KIND_MAP[type] : undefined;

    return {
      page_size: SLOTS_PAGE_SIZE,
      sort: popularFilter as SortType,
      sort_dir: 'asc',
      only_mobile: deviceType === 'mobile',
      only_new: type === 'newGames',
      only_popular: type === 'popularGames',
      only_featured: type === 'recommendedGames',
      game_kinds: gameKind ? [gameKind] : undefined,
      include_blocked_regions: true,
      search_query: debouncedSearchValue.trim() || undefined,
      provider_ids: providerFilter === 'all' ? undefined : [providerFilter],
    };
  }, [type, deviceType, debouncedSearchValue, providerFilter, popularFilter]);

  const { data, isFetching } = useGetShowcaseGamesQuery(queryParams);
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();
  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);
  const [isQueryParamsChanged, setIsQueryParamsChanged] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const previousQueryParamsRef = useRef<GetShowcaseGamesParams | undefined>(queryParams);

  useEffect(() => {
    resetFilters();
  }, [type, resetFilters]);

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

  const renderProviderItem = (item: DropdownMenuItems, onSelect: () => void): ReactNode => {
    const isActive = providerFilter === item.id;

    return (
      <div onClick={onSelect} className={clsx(styles.dropdownItem, isActive && styles.isActive)}>
        <span>{item.title}</span>
      </div>
    );
  };

  const renderPopularItem = (item: DropdownMenuItems, onSelect: () => void): ReactNode => {
    const isActive = popularFilter === item.id;

    const Icon = item.icon;

    return (
      <div onClick={onSelect} className={clsx(styles.popularItem, isActive && styles.isActive)}>
        {Icon && <Icon />}
        <span>{item.title}</span>
      </div>
    );
  };

  return (
    <div className={clsx(styles.slotsSection, className)}>
      <div className={styles.controls}>
        <Input
          icon={<SearchIcon />}
          placeholder={t('filters.searchPlaceholder')}
          value={searchValue}
          onChange={handleSearchChange}
        />
        <div className={styles.dropdownContainer}>
          <DropdownApp
            list={providerOptions}
            value={providerFilter}
            onChange={item => {
              handleProviderChange(item);
            }}
            itemsClassName={styles.dropdownItems}
            renderItem={renderProviderItem}
            triggerClassName={styles.triggerDropdown}
          />
          <DropdownApp
            list={popularOptions}
            value={popularFilter}
            onChange={item => {
              handlePopularChange(item);
            }}
            itemsClassName={styles.dropdownItems}
            renderItem={renderPopularItem}
            triggerClassName={styles.triggerDropdown}
          />
        </div>
      </div>

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
    </div>
  );
};
