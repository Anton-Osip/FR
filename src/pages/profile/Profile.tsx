import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui';

import styles from './Profile.module.scss';

import { SupportPanel, TransactionHistory, UserProfileInfo } from '@/widgets';

export const Profile: FC = () => {
  const { t: tBreadcrumbs } = useTranslation('breadcrumbs');

  const breadCrumbsItems = useMemo(() => [{ label: tBreadcrumbs('pages.profile') }], [tBreadcrumbs]);

  return (
    <div className={styles.profile}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <UserProfileInfo />
      <TransactionHistory />
      <SupportPanel />
    </div>
  );
};
