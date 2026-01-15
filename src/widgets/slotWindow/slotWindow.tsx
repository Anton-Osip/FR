import { FC, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useParams } from 'react-router-dom';

import { Spinner, Tab } from '@shared/ui';

import styles from './slotWindow.module.scss';
import { SlotWindowHeader } from './slotWindowHeader';

import { useGetSlotInfoQuery } from '@features/showcase';

interface slotWindowProps {
  className?: string;
}

export const SlotWindow: FC<slotWindowProps> = ({ className }) => {
  const { id: gameUuid } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('demo');

  const TabsItems: Tab[] = useMemo(
    () => [
      { id: '1', label: 'Демо', value: 'demo', active: activeTab === 'demo' },
      { id: '2', label: 'Играть', value: 'play', active: activeTab === 'play' },
    ],
    [activeTab],
  );

  const { data: slotInfo, isLoading } = useGetSlotInfoQuery(
    { game_uuid: gameUuid! },
    {
      skip: !gameUuid,
    },
  );

  return (
    <div className={clsx(styles.slotWindow, className)}>
      <SlotWindowHeader
        gameName={slotInfo?.name || ''}
        TabsItems={TabsItems}
        setTabsItem={setActiveTab}
        isFavorite={slotInfo?.is_favorite || false}
        isLoading={isLoading}
        gameUuid={gameUuid!}
      />
      <div className={styles.load}>
        <Spinner />
      </div>
    </div>
  );
};
