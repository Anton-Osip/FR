import { FC } from 'react';

import { APP_PATH } from '@shared/config';

import styles from './SlotInfo.module.scss';

import { ISlots } from '@features/bonus';

interface SlotInfoProps {
  slot: ISlots;
  onClose?: () => void;
}

const TIMEOUT_DELAY = 50;

export const SlotInfo: FC<SlotInfoProps> = ({ slot, onClose }) => {
  return (
    <div
      className={styles.slotInfo}
      onClick={() => {
        APP_PATH.slot.replace(':id', String(slot.uuid));
        setTimeout(() => onClose?.(), TIMEOUT_DELAY);
      }}
    >
      <div className={styles.slotImageWrapper}>
        <img src={slot.image_url} alt={slot.name} className={styles.slotImage} />
      </div>
      <div className={styles.slotDetails}>
        <h4 className={styles.slotName}>{slot.name}</h4>
        <p className={styles.slotProvider}>{slot.provider}</p>
      </div>
    </div>
  );
};
