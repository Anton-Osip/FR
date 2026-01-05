import type { FC, ReactNode } from 'react';
import { useRef } from 'react';

import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './MenuItem.module.scss';

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
  onItemClick?: () => void;
}

export const MenuItem: FC<MenuItemProps> = ({ label, icon, isActive, path, onItemClick }) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = path && location.pathname === path;

  const handleClick = (): void => {
    if (path) {
      navigate(path);
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <>
      <button
        ref={itemRef}
        className={clsx(styles.item, (isActive || isCurrentPath) && styles.isActive)}
        onClick={handleClick}
      >
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={styles.label}>{label}</span>
      </button>
    </>
  );
};
