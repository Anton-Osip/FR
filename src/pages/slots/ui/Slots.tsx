import { type FC } from 'react';

import { useParams } from 'react-router-dom';

import styles from './Slots.module.scss';

import { BetsSection, SlotsHeader, SlotsSection } from '@/widgets';
import { SLOTS_HEADER_MAP, type SlotsHeaderType } from '@/widgets/slotsHeader/constants';

const isValidSlotsHeaderType = (value: string | undefined): value is SlotsHeaderType => {
  if (!value) return false;

  return value in SLOTS_HEADER_MAP;
};

export const Slots: FC = () => {
  const { type } = useParams();
  const validType = isValidSlotsHeaderType(type) ? type : undefined;

  return (
    <div className={styles.slots}>
      <SlotsHeader className={styles.slotsHeader} type={validType} />
      <SlotsSection type={validType} />

      <BetsSection dropdownClassName={styles.dropdownClassName} headerClassName={styles.headerClassName} />
    </div>
  );
};
