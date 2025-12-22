import type { FC } from 'react';

import { Button } from '@shared/ui';
import { SupportIcon } from '@shared/ui/icons';

import styles from './SidebarFooter.module.scss';

interface SidebarFooterProps {
  isOpen: boolean;
  className?: string;
}

export const SidebarFooter: FC<SidebarFooterProps> = ({ isOpen, className }) => {
  return (
    <footer className={`${styles.footer} ${!isOpen ? styles.closed : ''} ${className ? className : ''}`}>
      <h3>
        Тех. поддержка <span className={styles['support-time']}>24/7</span>
      </h3>
      <Button size="s" icon={<SupportIcon />} variant="secondary">
        Написать
      </Button>
    </footer>
  );
};
