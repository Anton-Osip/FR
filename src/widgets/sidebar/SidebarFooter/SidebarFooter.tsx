import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { SupportIcon } from '@shared/ui/icons';

import styles from './SidebarFooter.module.scss';

interface SidebarFooterProps {
  isOpen: boolean;
  className?: string;
}

export const SidebarFooter: FC<SidebarFooterProps> = ({ isOpen, className }) => {
  const { t } = useTranslation('sidebar');

  return (
    <footer className={clsx(styles.footer, !isOpen ? styles.closed : '', className)}>
      <h3>
        {t('footer.support')} <span className={styles.supportTime}>24/7</span>
      </h3>
      <Button size="s" icon={<SupportIcon />} variant="secondary">
        {t('footer.write')}
      </Button>
    </footer>
  );
};
