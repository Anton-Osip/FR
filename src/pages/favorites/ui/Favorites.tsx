import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui';

import styles from './Favorites.module.scss';

export const Favorites: FC = () => {
  const { t: tBreadcrumbs } = useTranslation('breadcrumbs');
  const { t } = useTranslation('favorites');

  const breadCrumbsItems = useMemo(() => [{ label: tBreadcrumbs('pages.favorites') }], [tBreadcrumbs]);

  return (
    <div className={styles.favorites}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <div className={styles.content}>
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>
      </div>
    </div>
  );
};
