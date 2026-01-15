import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { useDebounce } from '@shared/lib';
import { Button, Dropdown, Input } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdown/Dropdown.tsx';
import { SearchIcon } from '@shared/ui/icons';

import type { SlotsHeaderType } from '@widgets/slotsHeader/constants.ts';
import { SlotsGrid } from '@widgets/slotsSection/ui/SlotsGrid/SlotsGrid.tsx';

import { POPULAR_OPTIONS, PROVIDER_OPTIONS, useSlotsFilters } from '../models/useSlotsFilters';

import styles from './SlotsSection.module.scss';

import { type GameKind } from '@entities/game';
import { useUserGeoCountry } from '@entities/user';
import {
  type GetShowcaseGamesParams,
  type ShowcaseGamesResponse,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
} from '@features/showcase';

interface SlotsSectionProps {
  className?: string;
  type?: SlotsHeaderType;
}

const DEFAULT_WINDOW_WIDTH = 864;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 864;
const MOBILE_PAGE_SIZE = 9;
const TABLET_PAGE_SIZE = 18;
const DESKTOP_PAGE_SIZE = 21;
const RESIZE_DEBOUNCE_MS = 150;
const SEARCH_DEBOUNCE_MS = 500;

const TYPE_TO_GAME_KIND_MAP: Partial<Record<SlotsHeaderType, GameKind>> = {
  baccaratGames: 'baccarat',
  blackjackGames: 'blackjack',
  rouletteGames: 'roulette',
  quickGames: 'fast',
  liveGames: 'live',
};

export const SlotsSection: FC<SlotsSectionProps> = ({ className, type }) => {
  const { providerFilter, popularFilter, searchValue, handleProviderChange, handlePopularChange, handleSearchChange } =
    useSlotsFilters();

  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);
  const { data: geo } = useUserGeoCountry();
  const deviceType = useAppSelector(selectDeviceType);
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }

    return DEFAULT_WINDOW_WIDTH;
  });

  const pageSize = useMemo(() => {
    if (windowWidth < MOBILE_BREAKPOINT) {
      return MOBILE_PAGE_SIZE;
    } else if (windowWidth >= MOBILE_BREAKPOINT && windowWidth <= TABLET_BREAKPOINT) {
      return TABLET_PAGE_SIZE;
    } else {
      return DESKTOP_PAGE_SIZE;
    }
  }, [windowWidth]);

  const countryIsBlocked = useCallback(
    (blockedCountries: string[] = []): boolean => {
      if (!geo?.country_code || !Array.isArray(blockedCountries) || blockedCountries.length === 0) {
        return false;
      }

      const userCountry = geo.country_code.toUpperCase();

      return blockedCountries.some(country => country?.toUpperCase() === userCountry);
    },
    [geo],
  );

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    const gameKind = type ? TYPE_TO_GAME_KIND_MAP[type] : undefined;

    return {
      page_size: pageSize,
      sort: 'popular',
      sort_dir: 'desc',
      only_mobile: deviceType === 'mobile',
      only_new: type === 'newGames',
      only_popular: type === 'popularGames',
      only_featured: type === 'recommendedGames',
      game_kinds: gameKind ? [gameKind] : undefined,
      include_blocked_regions: true,
      search_query: debouncedSearchValue.trim() || undefined,
    };
  }, [pageSize, deviceType, type, debouncedSearchValue]);

  const { data, isFetching } = useGetShowcaseGamesQuery(queryParams);
  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();
  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);
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
  const isButtonDisabled = !hasMore || isFetching || isButtonLoading;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = (): void => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  const renderProviderItem = (item: DropdownMenuItems, onSelect: () => void): ReactNode => {
    const isActive = typeof providerFilter === 'string' ? providerFilter === item.id : false;

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
        <Input icon={<SearchIcon />} placeholder={'Поиск'} value={searchValue} onChange={handleSearchChange} />
        <div className={styles.dropdownContainer}>
          <Dropdown
            list={PROVIDER_OPTIONS}
            value={typeof providerFilter === 'string' ? providerFilter : 'all'}
            onChange={item => {
              handleProviderChange(item);
            }}
            itemsClassName={styles.dropdownItems}
            renderItem={renderProviderItem}
            triggerClassName={styles.triggerDropdown}
          />
          <Dropdown
            list={POPULAR_OPTIONS}
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
      <Button
        variant={'tertiary'}
        size={'m'}
        className={clsx(styles.loadMore, isButtonLoading && styles.loadingButton)}
        icon={isButtonLoading ? <div className={styles.spinner} /> : undefined}
        onClick={handleLoadMore}
        disabled={isButtonDisabled}
      >
        Смотреть больше
      </Button>
    </div>
  );
};
