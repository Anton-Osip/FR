import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui/breadcrumbs';

import { SupportPanel } from '@widgets/supportPanel';
import { TransactionHistory } from '@widgets/transactionHistory';
import { UserProfileInfo } from '@widgets/userProfileInfo';

import styles from './Profile.module.scss';

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
