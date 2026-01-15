import { FC } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { Button } from '@shared/ui';
import { ArrowIcon } from '@shared/ui/icons';

import { SLOTS_HEADER_MAP, type SlotsHeaderType } from './constants';
import styles from './SlotsHeader.module.scss';

interface SlotsHeaderProps {
  className?: string;
  type?: SlotsHeaderType;
}

export const SlotsHeader: FC<SlotsHeaderProps> = ({ className, type = 'allGames' }) => {
  const { title } = SLOTS_HEADER_MAP[type];
  const navigate = useNavigate();

  const handleBackClick = (): void => {
    navigate(-1);
  };

  return (
    <div className={clsx(styles.slotsHeader, className)}>
      <Button
        variant="secondary"
        square
        icon={<ArrowIcon className={styles.arrow} />}
        className={styles.backBtn}
        onClick={handleBackClick}
      />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};
