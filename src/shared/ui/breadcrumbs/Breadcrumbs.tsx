import type { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_PATH } from '@shared/config/routes.ts';

import styles from './Breadcrumbs.module.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, className }) => {
  const { t } = useTranslation('breadcrumbs');

  return (
    <nav aria-label={t('ariaLabel')} className={className ?? className}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link to={APP_PATH.main} className={styles.link}>
            {t('home')}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className={styles.item}>
              {isLast || !item.href ? (
                <span className={styles.current}>{item.label}</span>
              ) : (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
