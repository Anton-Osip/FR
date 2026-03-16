import { FC, ReactNode } from 'react';

import styles from './BonusInfoItem.module.scss';

interface BonusInfoItemProps {
  label: string;
  value: ReactNode;
  hidden?: boolean;
}

export const BonusInfoItem: FC<BonusInfoItemProps> = ({ label, value, hidden = false }) => {
  if (hidden) {
    return null;
  }

  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
};
