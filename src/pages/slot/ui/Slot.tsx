import { type FC } from 'react';

import { useMediaQuery } from '@shared/lib';

import styles from './Slot.module.scss';

import { BetsSection, DesktopPedestalSection, MobilePedestalSection, SlotInfoMobile, SlotWindow } from '@/widgets';

export const Slot: FC = () => {
  const isDesktop = useMediaQuery('(min-width: 650px)');

  return (
    <div className={styles.slot}>
      {isDesktop ? <SlotWindow className={styles.slotWindow} /> : <SlotInfoMobile className={styles.slotInfoMobile} />}

      {isDesktop ? (
        <DesktopPedestalSection className={styles.desktopPedestalSection} />
      ) : (
        <MobilePedestalSection className={styles.mobilePedestalSection} />
      )}

      <BetsSection dropdownClassName={styles.betsSectionDropdown} />
    </div>
  );
};
