import { type FC } from 'react';

import { useParams } from 'react-router-dom';

import { useMediaQuery } from '@shared/lib';

import { BetsSection } from '@widgets/betsSection';
import { DesktopPedestalSection, MobilePedestalSection } from '@widgets/pedestalSection';
import { SlotInfoMobile } from '@widgets/slotInfoMobile';
import { SlotWindow } from '@widgets/slotWindow';

import styles from './Slot.module.scss';

export const Slot: FC = () => {
  const isDesktop = useMediaQuery('(min-width: 760px)');
  const { id: gameUuid } = useParams<{ id: string }>();

  return (
    <>
      {isDesktop ? (
        <SlotWindow className={styles.slotWindow} />
      ) : (
        <div className={styles.slotInfoMobile}>
          <SlotInfoMobile />
        </div>
      )}
      <div className={styles.container}>
        {isDesktop ? (
          <DesktopPedestalSection className={styles.desktopPedestalSection} />
        ) : (
          <MobilePedestalSection className={styles.mobilePedestalSection} />
        )}
        <BetsSection gameUuid={gameUuid} page={'game'} />
      </div>
    </>
  );
};
