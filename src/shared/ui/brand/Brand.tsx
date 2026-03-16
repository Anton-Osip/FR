import type { FC } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/config/routes.ts';
import { FrostyIcon } from '@shared/ui/icons';

import styles from './Brand.module.scss';

interface BrandProps {
  className?: string;
}

export const Brand: FC<BrandProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div
      className={clsx(styles.brand, className ?? '')}
      onClick={() => {
        navigate(APP_PATH.main);
      }}
    >
      <div className={styles.frostyIcon}>
        <FrostyIcon />
      </div>
      <span className={styles.text}>Frosty</span>
    </div>
  );
};
