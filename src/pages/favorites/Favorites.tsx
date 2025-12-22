import { type FC } from 'react';

import { Breadcrumbs } from '@shared/ui/breadcrumbs';

import styles from './Favorites.module.scss';

const breadCrumbsItems = [{ label: 'Избранное' }];

export const Favorites: FC = () => {
  return (
    <div className={styles.favorites}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <div className={styles.content}>
        <h2>Избранное</h2>
        <p>Здесь будут отображаться ваши избранные игры и контент</p>
      </div>
    </div>
  );
};
