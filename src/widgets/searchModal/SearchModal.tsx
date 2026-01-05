import { ChangeEvent, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { selectDeviceType } from '@app/store';

import { useAppSelector } from '@shared/api';
import { Button, Input, Modal, Tabs } from '@shared/ui';
import { FireIcon, FlashIcon, MicrophoneIcon, RepeatIcon, SearchIcon, SevenIcon, WindowIcon } from '@shared/ui/icons';
import type { Tab } from '@shared/ui/tabs/Tabs';

import styles from './SearchModal.module.scss';

import type { GameKind } from '@/entities/game';
import type { GetShowcaseGamesParams, ShowcaseGamesResponse } from '@/features/showcase';
import { useGetShowcaseGamesQuery, useLazyGetShowcaseGamesQuery } from '@/features/showcase';

// Константы для размеров окна и пагинации
const DEFAULT_WINDOW_WIDTH = 1024;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;
const MOBILE_PAGE_SIZE = 9;
const TABLET_PAGE_SIZE = 18;
const DESKTOP_PAGE_SIZE = 15;
const RESIZE_DEBOUNCE_MS = 150;
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
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }

    return DEFAULT_WINDOW_WIDTH;
  });
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
        label: 'Новинки',
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

  const pageSize = useMemo(() => {
    if (windowWidth < MOBILE_BREAKPOINT) {
      return MOBILE_PAGE_SIZE;
    } else if (windowWidth >= MOBILE_BREAKPOINT && windowWidth <= TABLET_BREAKPOINT) {
      return TABLET_PAGE_SIZE;
    } else {
      return DESKTOP_PAGE_SIZE;
    }
  }, [windowWidth]);

  const queryParams: GetShowcaseGamesParams | undefined = useMemo(() => {
    if (!open) return undefined;

    return {
      page_size: pageSize,
      sort: 'popular',
      only_new: activeTab === 'new' || undefined,
      game_kinds: activeTab !== 'new' && activeTab !== 'all' ? [activeTab] : undefined,
      sort_dir: 'desc',
      search_query: searchQuery.trim() || undefined,
      only_mobile: deviceType === 'mobile',
    };
  }, [open, pageSize, activeTab, searchQuery, deviceType]);

  const { data: initialData, isLoading } = useGetShowcaseGamesQuery(queryParams, {
    skip: !open || !queryParams,
  });

  const [loadMoreQuery, { isLoading: isLoadingMore }] = useLazyGetShowcaseGamesQuery();

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
    <Modal trigger={trigger} open={open} onOpenChange={onOpenChange} title={t('title')} contentClassName={styles.modal}>
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
            {!isLoading && !isInitialLoading && accumulatedData?.items.length === 0 && (
              <div className={styles.emptyMessage}>
                <span>{t('nothingFound')}</span>
              </div>
            )}

            <div className={styles.grid}>
              {(isLoading || isInitialLoading) && !accumulatedData
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <div className={`${styles.imageWrapper} ${styles.skeleton}`} key={`skeleton-${index}`}>
                      <div className={styles.skeletonContent} />
                    </div>
                  ))
                : accumulatedData?.items.map(g => (
                    <div className={styles.imageWrapper} key={g.id}>
                      {g.image ? <img src={g.image} alt={g.name || 'Game'} /> : <div className={styles.placeholder} />}
                    </div>
                  ))}
            </div>
            <div className={styles.more}>
              <p className={styles.text}>
                {t('shown')}: {accumulatedData?.items.length || 0} {t('of')} {accumulatedData?.meta.total || 0}
              </p>
              <Button
                variant={'tertiary'}
                size={'s'}
                icon={isLoadingMore || isLoadingMoreLocal ? <div className={styles.spinner} /> : <RepeatIcon />}
                onClick={loadMore}
                disabled={
                  isLoading ||
                  isInitialLoading ||
                  isLoadingMore ||
                  isLoadingMoreLocal ||
                  !accumulatedData?.meta.has_more
                }
                className={isLoadingMore || isLoadingMoreLocal ? styles.loadingButton : ''}
              >
                {t('showMore')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
