import type { FC, ReactNode } from 'react';
import { useRef, useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { APP_PATH } from '@shared/config/routes.ts';

import styles from './MenuItem.module.scss';

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  path?: string;
  onRequireAuth?: () => void;
  isLoggedIn?: boolean;
}

// Пути, которые требуют авторизации
const AUTH_REQUIRED_PATHS: string[] = [APP_PATH.favorites, APP_PATH.invite, APP_PATH.bonuses];

export const MenuItem: FC<MenuItemProps> = ({ label, icon, isActive, isOpen, path, onRequireAuth, isLoggedIn }) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPath = path && location.pathname === path;
  const requiresAuth = path ? AUTH_REQUIRED_PATHS.includes(path) : false;

  useEffect(() => {
    if (isHovered && itemRef.current && !isOpen) {
      const rect = itemRef.current.getBoundingClientRect();

      const DIVISOR_FOR_CENTER = 2;

      setTooltipPosition({
        top: rect.top + rect.height / DIVISOR_FOR_CENTER,
        left: rect.right,
      });
    }
  }, [isHovered, isOpen]);

  const handleClick = (): void => {
    if (!path) return;

    // Если путь требует авторизации и пользователь не авторизован, открываем модалку
    if (requiresAuth && !isLoggedIn && onRequireAuth) {
      onRequireAuth();

      return;
    }

    // Иначе переходим на страницу
    navigate(path);
  };

  return (
    <>
      <button
        ref={itemRef}
        className={`${styles.item} ${(isActive || isCurrentPath) && styles.isActive} ${
          !isOpen ? styles.unVisible : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={styles.label}>{label}</span>
      </button>
      {!isOpen && (
        <span
          className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {label}
        </span>
      )}
    </>
  );
};
