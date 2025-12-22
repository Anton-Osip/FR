import type { FC } from 'react';

import { Avatar } from '@shared/ui';

import { UserAmountProgress } from './UserAmountProgress';
import styles from './UserInfo.module.scss';

import silverBg from '@assets/icons/silver-bg.svg?url';

interface User {
  id: string;
  username: string;
  balance: string;
  avatar?: string;
}

interface Props {
  user: User;
}

export const UserInfo: FC<Props> = ({ user }) => {
  return (
    <div className={styles.info}>
      <div className={styles.infoWrap}>
        <div className={styles.user}>
          <Avatar />
          <div className={styles.userData}>
            <p className={styles.userName}>{user.username}</p>
            <p className={styles.userIdWrapper}>
              <span className={styles.userId}>UID: </span>
              {user.id}
            </p>
          </div>
        </div>
        <UserAmountProgress amount={user.balance} />
      </div>
      <img className={styles.userInfoImage} src={silverBg} alt="silver" />
    </div>
  );
};
