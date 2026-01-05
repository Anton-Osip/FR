import { type FC, type KeyboardEvent, type SVGProps } from 'react';

import clsx from 'clsx';

import styles from './TabMenuItem.module.scss';

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  isActive?: boolean;
}

export const TabMenuItem: FC<Props> = ({ title, icon: Icon, onClick, isActive }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (onClick || (() => {}))();
    }
  };

  return (
    <div
      className={clsx(styles.tabMenuItem, isActive ? styles.active : '')}
      onClick={onClick || (() => {})}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Icon />
      <h3>{title}</h3>
    </div>
  );
};
