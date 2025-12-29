import type { FC, ReactNode } from 'react';

import { MenuItem } from './MenuItem/MenuItem';
import styles from './MenuSection.module.scss';

interface MenuSectionProps {
  list: MenuItems[];
  title: string;
  isOpen: boolean;
  className?: string;
  onRequireAuth?: () => void;
  isLoggedIn?: boolean;
}

interface MenuItems {
  id: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
}

export const MenuSection: FC<MenuSectionProps> = ({ list, title, isOpen, className, onRequireAuth, isLoggedIn }) => {
  return (
    <div className={`${styles.menuSection} ${className ?? ''}`}>
      <h3 className={`${styles.title} ${!isOpen ? styles.hidden : ''}`}>{title}</h3>
      {list.map(item => (
        <MenuItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          isOpen={isOpen}
          path={item.path}
          onRequireAuth={onRequireAuth}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
};
