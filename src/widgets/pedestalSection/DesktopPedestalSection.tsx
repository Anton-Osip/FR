import { FC } from 'react';

import clsx from 'clsx';
import { useParams } from 'react-router-dom';

import { PedestalItems } from '@widgets/pedestalSection/PedestalItems';

import styles from './DesktopPedestalSection.module.scss';

import {
  useGetSlotLeaderboardBigWinsQuery,
  useGetSlotLeaderboardLuckyQuery,
  useGetSlotLeaderboardTodayBestQuery,
} from '@features/showcase';

interface DesktopPedestalSectionProps {
  className?: string;
}

export const DesktopPedestalSection: FC<DesktopPedestalSectionProps> = ({ className }) => {
  const { id: gameUuid } = useParams<{ id: string }>();

  const { data: leaderboardBigWins, isLoading: isLoadingBigWins } = useGetSlotLeaderboardBigWinsQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid },
  );
  const { data: leaderboardLucky, isLoading: isLoadingLucky } = useGetSlotLeaderboardLuckyQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid },
  );
  const { data: leaderboardTodayBest, isLoading: isLoadingTodayBest } = useGetSlotLeaderboardTodayBestQuery(
    { game_uuid: gameUuid || '' },
    { skip: !gameUuid },
  );

  return (
    <div className={clsx(styles.pedestalSection, className)}>
      <PedestalItems title={'Крупные выигрыши'} data={leaderboardBigWins?.items} isLoading={isLoadingBigWins} />
      <PedestalItems title={'Удачные ставки'} data={leaderboardLucky?.items} isLoading={isLoadingLucky} />
      <PedestalItems title={'Лучшие за сегодня'} data={leaderboardTodayBest?.items} isLoading={isLoadingTodayBest} />
    </div>
  );
};
