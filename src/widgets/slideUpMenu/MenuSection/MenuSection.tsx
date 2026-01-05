import type { FC, ReactNode } from 'react';

import clsx from 'clsx';

import { MenuItem } from './MenuItem/MenuItem';
import styles from './MenuSection.module.scss';

interface MenuSectionProps {
  list: MenuItems[];
  title: string;
  className?: string;
  onItemClick?: () => void;
}

interface MenuItems {
  id: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
}

export const MenuSection: FC<MenuSectionProps> = ({ list, title, className, onItemClick }) => {
  return (
    <div className={clsx(styles.menuSection, className)}>
      <h3 className={styles.title}>{title}</h3>
      {list.map(item => (
        <MenuItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          path={item.path}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};
