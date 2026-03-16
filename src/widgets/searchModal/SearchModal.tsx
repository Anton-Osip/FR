import { ChangeEvent, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { EmptyState, Input, LoadMoreFooter, Modal, Tabs } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { FireIcon, FlashIcon, MicrophoneIcon, SearchIcon, SevenIcon, WindowIcon } from '@shared/ui/icons';

import { CarouselItem } from '@widgets/carouselItem/CarouselItem';
import { CarouselItemSkeleton } from '@widgets/carouselItem/CarouselItemSkeleton';

import styles from './SearchModal.module.scss';

import type { GameKind } from '@/entities/game';
import type { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@/features/showcase';
import {
  MIN_TOTAL_TO_SHOW_LOAD_MORE,
  SLOTS_PAGE_SIZE,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
} from '@/features/showcase';
import { useCountryIsBlocked } from '@entities/user';

const SEARCH_DEBOUNCE_MS = 500;

interface SearchModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface InitialTabs {
  id: string;
  value: GameKind | 'all' | 'new';
  label: string;
  icon: ReactNode;
}

export const SearchModal: FC<SearchModalProps> = ({ trigger, open, onOpenChange }) => {
  const { t } = useTranslation('searchModal');
  const [activeTab, setActiveTab] = useState<GameKind | 'all' | 'new'>('all');
  const [inputValue, setInputValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accumulatedData, setAccumulatedData] = useState<ShowcaseGamesResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingMoreRef = useRef(false);
  const deviceType = useAppSelector(selectDeviceType);
  const countryIsBlocked = useCountryIsBlocked();

  const initialTabs: InitialTabs[] = useMemo(
    () => [
      {
        id: '1',
        value: 'all',
        label: t('allGames'),
        icon: <WindowIcon />,
      },
      {
        id: '2',
        value: 'new',
        label: t('newGames'),
        icon: <FireIcon />,
      },
      {
        id: '3',
        value: 'slot',
        label: t('slots'),
        icon: <SevenIcon />,
      },
      {
        id: '4',
        value: 'live',
        label: t('liveGames'),
        icon: <MicrophoneIcon />,
      },
      {
        id: '5',
        value: 'fast',
        label: t('quickGames'),
        icon: <FlashIcon />,
      },
    ],
    [t],
  );

  const tabs: Tab[] = useMemo(
    () => initialTabs.map(tab => ({ ...tab, active: tab.value === activeTab })),
    [initialTabs, activeTab],
  );

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    if (!open) return undefined;

    return {
      page_size: SLOTS_PAGE_SIZE,
      sort: 'popular',
      only_new: activeTab === 'new' || undefined,
      game_kinds: activeTab !== 'new' && activeTab !== 'all' ? [activeTab] : undefined,
      sort_dir: 'desc',
      search_query: searchQuery.trim() || undefined,
      only_mobile: deviceType === 'mobile',
      include_blocked_regions: true,
    };
  }, [open, activeTab, searchQuery, deviceType]);

  const { data: initialData, isLoading } = useGetShowcaseGamesQuery(queryParams, {
    skip: !open || !queryParams,
  });

  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();

  useEffect(() => {
    if (initialData) {
      setAccumulatedData(initialData);
      setIsInitialLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (isLoading && !initialData) {
      setIsInitialLoading(true);
    }
  }, [isLoading, initialData]);

  const activeTabData = useMemo(() => {
    return initialTabs.find(tab => tab.value === activeTab) || initialTabs[0];
  }, [initialTabs, activeTab]);

  const hasMore = (accumulatedData || initialData)?.meta.has_more ?? false;

  const gamesWithBlockedStatus = useMemo(() => {
    if (!accumulatedData?.items) return [];

    return accumulatedData.items.map(game => ({
      ...game,
      isBlocked: countryIsBlocked(game.blocked_countries),
    }));
  }, [accumulatedData?.items, countryIsBlocked]);

  const handleGameClick = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleTabChange = (value: string): void => {
    const newTab = value as GameKind | 'all' | 'new';

    if (newTab === activeTab) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    isLoadingMoreRef.current = false;
    setIsLoadingMoreLocal(false);
    setSearchQuery(inputValue.trim());
    setAccumulatedData(null);
    setIsInitialLoading(true);
    setActiveTab(newTab);
  };

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;

      setInputValue(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (open) {
          setSearchQuery(value);
          setAccumulatedData(null);
          setIsInitialLoading(true);
        }
        searchTimeoutRef.current = null;
      }, SEARCH_DEBOUNCE_MS);
    },
    [open],
  );

  useEffect(() => {
    if (!open) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      isLoadingMoreRef.current = false;
      setIsLoadingMoreLocal(false);
      setInputValue('');
      setSearchQuery('');
    }
  }, [open]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (
      !accumulatedData?.meta.has_more ||
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
        cursor: accumulatedData.meta.next_cursor,
      };

      const result = await loadMoreQuery(nextParams).unwrap();

      setAccumulatedData(prevData => {
        if (!prevData) return result;

        return {
          ...result,
          items: [...prevData.items, ...result.items],
        };
      });
    } catch {
      // Ошибка обрабатывается через error state
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMoreLocal(false);
    }
  }, [accumulatedData, isLoadingMore, isLoadingMoreLocal, loadMoreQuery, queryParams]);

  return (
    <Modal
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      contentClassName={styles.modal}
      bodyClassName={styles.modalBody}
    >
      <div className={styles.body}>
        <div className={styles.searchWrapper}>
          <Input icon={<SearchIcon />} placeholder={t('placeholder')} value={inputValue} onChange={handleInputChange} />
          <Tabs size={'m'} items={tabs} onChange={handleTabChange} className={styles.tabs} />
        </div>

        <div className={styles.games}>
          <header className={styles.header}>
            <div className={styles.tabIcon}>{activeTabData.icon}</div>
            <h3 className={styles.tabTitle}>{activeTabData.label}</h3>
          </header>
          <div className={styles.slots}>
            {!isLoading && !isInitialLoading && accumulatedData && accumulatedData.items.length === 0 && <EmptyState />}

            <div className={styles.grid}>
              {(isLoading || isInitialLoading) && !accumulatedData
                ? Array.from({ length: SLOTS_PAGE_SIZE }).map((_, index) => (
                    <CarouselItemSkeleton key={`skeleton-${index}`} />
                  ))
                : gamesWithBlockedStatus.map(g => (
                    <CarouselItem
                      key={g.id}
                      onClick={handleGameClick}
                      data={{
                        id: g.id,
                        type: 'item',
                        img: g.image,
                        link: APP_PATH.slot.replace(':id', String(g.uuid)),
                        is_favorite: g.is_favorite,
                        blocked_countries: g.isBlocked,
                        name: g.name,
                      }}
                    />
                  ))}
              {!isLoading &&
                !isInitialLoading &&
                accumulatedData &&
                accumulatedData.meta.total > MIN_TOTAL_TO_SHOW_LOAD_MORE && (
                  <LoadMoreFooter
                    shown={accumulatedData.items.length}
                    total={accumulatedData.meta.total}
                    hasMore={hasMore}
                    isLoading={isLoadingMore || isLoadingMoreLocal}
                    onLoadMore={loadMore}
                    shownLabel={t('shown')}
                    ofLabel={t('of')}
                    showMoreLabel={t('showMore')}
                    loadingSpinner={<div className={styles.spinner} />}
                    className={styles.more}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
