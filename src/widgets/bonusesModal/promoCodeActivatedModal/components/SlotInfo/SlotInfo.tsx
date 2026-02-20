import { FC } from 'react';

import styles from './SlotInfo.module.scss';

import { Game } from '@entities/game';

interface SlotInfoProps {
  slot: Game;
}

export const SlotInfo: FC<SlotInfoProps> = ({ slot }) => {
  return (
    <div className={styles.slotInfo}>
      <div className={styles.slotImageWrapper}>
        <img src={slot.image} alt={slot.name} className={styles.slotImage} />
      </div>
      <div className={styles.slotDetails}>
        <h4 className={styles.slotName}>{slot.name}</h4>
        <p className={styles.slotProvider}>{slot.provider.name}</p>
      </div>
    </div>
  );
};
