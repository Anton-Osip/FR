import { type FC } from 'react';

import { Breadcrumbs } from '@shared/ui/breadcrumbs';

import { SupportPanel } from '@widgets/supportPanel';
import { TransactionHistory } from '@widgets/transactionHistory';
import { UserProfileInfo } from '@widgets/userProfileInfo';

import styles from './Profile.module.scss';

const breadCrumbsItems = [{ label: 'Профиль' }];

export const Profile: FC = () => {
  return (
    <div className={styles.profile}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <UserProfileInfo />
      <TransactionHistory />
      <SupportPanel />
    </div>
  );
};
