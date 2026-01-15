import { FC, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useParams } from 'react-router-dom';

import { Tabs, type Tab } from '@shared/ui';

import { TAB_OPTIONS_SLOTS } from '@widgets/pedestalSection/constants';
import { PedestalItems } from '@widgets/pedestalSection/PedestalItems';

import styles from './MobilePedestalSection.module.scss';

import {
  useGetSlotLeaderboardBigWinsQuery,
  useGetSlotLeaderboardLuckyQuery,
  useGetSlotLeaderboardTodayBestQuery,
  type SlotLeaderboardBigWinItem,
  type SlotLeaderboardLuckyItem,
  type SlotLeaderboardTodayBestItem,
} from '@features/showcase';

interface MobilePedestalSectionProps {
  className?: string;
}

export const MobilePedestalSection: FC<MobilePedestalSectionProps> = ({ className }) => {
  const { id: gameUuid } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>(TAB_OPTIONS_SLOTS[0].value);

  const { data: leaderboardBigWins, isLoading: isLoadingBigWins } = useGetSlotLeaderboardBigWinsQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid || activeTab !== 'big_wins' },
  );
  const { data: leaderboardLucky, isLoading: isLoadingLucky } = useGetSlotLeaderboardLuckyQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid || activeTab !== 'lucky_bets' },
  );
  const { data: leaderboardTodayBest, isLoading: isLoadingTodayBest } = useGetSlotLeaderboardTodayBestQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid || activeTab !== 'today_best' },
  );

  const tabsItems: Tab[] = useMemo(
    () =>
      TAB_OPTIONS_SLOTS.map((option, index) => ({
        id: String(index + 1),
        value: option.value,
        label: option.label,
        active: activeTab === option.value,
      })),
    [activeTab],
  );

  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  type LeaderboardItem = SlotLeaderboardBigWinItem | SlotLeaderboardLuckyItem | SlotLeaderboardTodayBestItem;

  const getCurrentData = (): { data?: LeaderboardItem[]; isLoading: boolean; title?: string } => {
    switch (activeTab) {
      case 'big_wins':
        return { data: leaderboardBigWins?.items, isLoading: isLoadingBigWins };
      case 'lucky_bets':
        return { data: leaderboardLucky?.items, isLoading: isLoadingLucky };
      case 'today_best':
        return { data: leaderboardTodayBest?.items, isLoading: isLoadingTodayBest };
      default:
        return { data: undefined, isLoading: false, title: '' };
    }
  };

  const { data, isLoading } = getCurrentData();

  return (
    <div className={clsx(styles.pedestalSection, className)}>
      <Tabs items={tabsItems} onChange={handleTabChange} className={styles.tabs} />
      <PedestalItems data={data} isLoading={isLoading} />
    </div>
  );
};
