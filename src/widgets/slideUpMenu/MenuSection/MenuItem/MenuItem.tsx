import type { FC, ReactNode } from 'react';

import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';

import { AUTH_REQUIRED_PATHS } from '@shared/config';

import styles from './MenuItem.module.scss';

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
  onItemClick?: () => void;
  onRequireAuth?: () => void;
  isLoggedIn?: boolean;
}

const MENU_CLOSE_DELAY_MS = 150;

export const MenuItem: FC<MenuItemProps> = ({
  label,
  icon,
  isActive,
  path,
  onItemClick,
  onRequireAuth,
  isLoggedIn,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = path && location.pathname === path;
  const requiresAuth = path ? (AUTH_REQUIRED_PATHS as readonly string[]).includes(path) : false;

  const handleClick = (): void => {
    if (!path) return;

    if (requiresAuth && !isLoggedIn && onRequireAuth) {
      if (onItemClick) {
        onItemClick();
      }

      setTimeout(() => {
        onRequireAuth();
      }, MENU_CLOSE_DELAY_MS);

      return;
    }

    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <button className={clsx(styles.item, (isActive || isCurrentPath) && styles.isActive)} onClick={handleClick}>
      <div className={styles.iconWrapper}>{icon}</div>
      <span className={styles.label}>{label}</span>
    </button>
  );
};
