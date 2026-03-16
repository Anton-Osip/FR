import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { SupportIcon } from '@shared/ui/icons';

import styles from './SidebarFooter.module.scss';

import { useGetLinksResolveQuery } from '@features/links';

interface SidebarFooterProps {
  isOpen: boolean;
  className?: string;
}

export const SidebarFooter: FC<SidebarFooterProps> = ({ isOpen, className }) => {
  const { t } = useTranslation('sidebar');

  const { data: linksResolve } = useGetLinksResolveQuery({});

  return (
    <footer className={clsx(styles.footer, styles.headerClip, !isOpen ? styles.closed : '', className)}>
      <h3>
        {t('footer.support')} <span className={styles.supportTime}>24/7</span>
      </h3>
      <Button size="s" variant="tertiary" onClick={() => window.open(String(linksResolve?.links.support), '_blank')}>
        <span className={styles.buttonContent}>
          <SupportIcon />
          <span>{t('footer.write')}</span>
        </span>
      </Button>
    </footer>
  );
};
