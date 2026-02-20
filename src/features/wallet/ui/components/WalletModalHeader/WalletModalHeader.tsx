import { FC } from 'react';

import { Button } from '@shared/ui';
import { ArrowIcon } from '@shared/ui/icons';

import styles from './WalletModalHeader.module.scss';

interface WalletModalHeaderProps {
  title: string;
  onBack: () => void;
}

export const WalletModalHeader: FC<WalletModalHeaderProps> = ({ title, onBack }) => {
  return (
    <header className={styles.header}>
      <Button
        variant="secondary"
        square
        icon={<ArrowIcon className={styles.arrow} />}
        className={styles.backBtn}
        onClick={onBack}
      />
      <h3 className={styles.title}>{title}</h3>
    </header>
  );
};
