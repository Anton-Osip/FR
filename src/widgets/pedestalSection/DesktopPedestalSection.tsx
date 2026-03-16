import { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('slot');
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
      <PedestalItems title={t('leaderboard.bigWins')} data={leaderboardBigWins?.items} isLoading={isLoadingBigWins} />
      <PedestalItems title={t('leaderboard.luckyBets')} data={leaderboardLucky?.items} isLoading={isLoadingLucky} />
      <PedestalItems
        title={t('leaderboard.todayBest')}
        data={leaderboardTodayBest?.items}
        isLoading={isLoadingTodayBest}
      />
    </div>
  );
};
