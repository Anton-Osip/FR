import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import silverBg from '@shared/assets/icons/silver-bg.svg?url';
import { Avatar } from '@shared/ui';

import { UserAmountProgress } from './UserAmountProgress';
import styles from './UserInfo.module.scss';

interface User {
  id: string;
  username: string;
  balance: string;
  avatar?: string;
}

interface Props {
  user: User;
  className?: string;
}

export const UserInfo: FC<Props> = ({ user, className }) => {
  const { t } = useTranslation('profile');

  return (
    <div className={clsx(styles.info, className)}>
      <div className={styles.infoWrap}>
        <div className={styles.user}>
          <Avatar className={styles.avatar} />
          <div className={styles.userData}>
            <p className={styles.userName}>{user.username}</p>
            <p className={styles.userIdWrapper}>
              <span className={styles.userId}>{t('userInfo.uid')} </span>
              {user.id}
            </p>
          </div>
        </div>
        <UserAmountProgress amount={user.balance} isProfile={true} className={styles.userAmountProgress} />
      </div>
      <img className={styles.userInfoImage} src={silverBg} alt={t('userInfo.silverAlt')} />
    </div>
  );
};
