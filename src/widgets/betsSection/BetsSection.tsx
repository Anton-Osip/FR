import { type FC, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { Tabs } from '@shared/ui';
import { Dropdown } from '@shared/ui/dropdown/Dropdown.tsx';

import { BettingTable } from '@widgets/bettingTable';
import { LoginModal } from '@widgets/loginModal';

import styles from './BetsSection.module.scss';

import {
  useGetBettingTableBetsBigWinsQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
} from '@/features/showcase';

const DEFAULT_PAGE_SIZE = 10;

const selectItems = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '40', label: '40' },
  { value: '50', label: '50' },
];

type TabValue = 'lastBets' | 'myBets' | 'bigPlayers';

export const BetsSection: FC = () => {
  const { t } = useTranslation('home');
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [activeTab, setActiveTab] = useState<TabValue>('lastBets');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const tabsItems = useMemo(
    () => [
      {
        id: 'lastBets',
        value: 'lastBets',
        label: t('betsSection.tabs.lastBets'),
        active: activeTab === 'lastBets',
      },
      {
        id: 'myBets',
        value: 'myBets',
        label: t('betsSection.tabs.myBets'),
        active: activeTab === 'myBets',
      },
      {
        id: 'bigPlayers',
        value: 'bigPlayers',
        label: t('betsSection.tabs.bigPlayers'),
        active: activeTab === 'bigPlayers',
      },
    ],
    [t, activeTab],
  );

  const {
    data: betsLatest,
    isLoading: isLoadingBetsLatest,
    isFetching: isFetchingBetsLatest,
  } = useGetBettingTableBetsLatestQuery(
    { page_size: pageSize },
    {
      skip: activeTab !== 'lastBets',
    },
  );
  const {
    data: betsMy,
    isLoading: isLoadingBetsMy,
    isFetching: isFetchingBetsMy,
  } = useGetBettingTableBetsMyQuery(
    { page_size: pageSize },
    {
      skip: activeTab !== 'myBets',
    },
  );
  const {
    data: betsBigWins,
    isLoading: isLoadingBetsBigWins,
    isFetching: isFetchingBetsBigWins,
  } = useGetBettingTableBetsBigWinsQuery(
    { page_size: pageSize },
    {
      skip: activeTab !== 'bigPlayers',
    },
  );

  const handleTabChange = (value: string): void => {
    const newTab = value as TabValue;

    if (newTab === 'myBets' && !isLoggedIn) {
      setIsLoginModalOpen(true);

      return;
    }

    setActiveTab(newTab);
  };

  const handlePageSizeChange = (
    option: { value: string; label: string } | { value: string; label: string }[],
  ): void => {
    const selectedOption = Array.isArray(option) ? option[0] : option;

    setPageSize(Number.parseInt(selectedOption.value, 10));
  };

  const getCurrentData = (): {
    data: typeof betsLatest | typeof betsMy | typeof betsBigWins;
    isLoading: boolean;
    isFetching: boolean;
  } => {
    switch (activeTab) {
      case 'lastBets':
        return {
          data: betsLatest,
          isLoading: isLoadingBetsLatest,
          isFetching: isFetchingBetsLatest,
        };
      case 'myBets':
        return { data: betsMy, isLoading: isLoadingBetsMy, isFetching: isFetchingBetsMy };
      case 'bigPlayers':
        return {
          data: betsBigWins,
          isLoading: isLoadingBetsBigWins,
          isFetching: isFetchingBetsBigWins,
        };
      default:
        return {
          data: betsLatest,
          isLoading: isLoadingBetsLatest,
          isFetching: isFetchingBetsLatest,
        };
    }
  };

  const { data, isLoading, isFetching } = getCurrentData();

  const shouldShowSkeleton = isLoading || isFetching;

  return (
    <section className={styles.betsSection}>
      <div className={styles.tableFilter}>
        <h4 className={styles.title}>{t('betsSection.title')}</h4>
        <div className={styles.wrapper}>
          <Tabs items={tabsItems} size="s" className={styles.tabs} onChange={handleTabChange} />
          <div className={styles.dropdownWrapper}>
            <Dropdown value={String(pageSize)} options={selectItems} onChange={handlePageSizeChange} />
          </div>
        </div>
      </div>

      <BettingTable items={shouldShowSkeleton ? undefined : data?.items} isLoading={shouldShowSkeleton} />

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </section>
  );
};
