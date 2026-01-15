import { FC } from 'react';

import { UserBalance } from './UserBalance';
import { UserInfo } from './UserInfo';
import styles from './UserProfileInfo.module.scss';

const mockUser = {
  id: '904014',
  username: 'Username',
  balance: '25.1',
};

export const UserProfileInfo: FC = () => {
  return (
    <div className={styles.userInfo}>
      <UserInfo user={mockUser} className={styles.userInfoComponent} />
      <UserBalance isMain amount={1000584} className={styles.userBalance} />
      <UserBalance isMain={false} amount={50265} className={styles.userBalance} />
    </div>
  );
};
