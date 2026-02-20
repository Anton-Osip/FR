import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { getRankConfig } from '@shared/config';
import { Avatar } from '@shared/ui';

import { UserAmountProgress } from './UserAmountProgress';
import { useUserAmountProgress } from './UserAmountProgress/useUserAmountProgress';
import styles from './UserInfo.module.scss';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Props {
  user: User;
  isLoading?: boolean;
  className?: string;
}

export const UserInfo: FC<Props> = ({ user, className, isLoading = false }) => {
  const { t } = useTranslation('profile');
  const { currentRank } = useUserAmountProgress();

  const nameContent = isLoading ? <span className={styles.skeletonName} /> : user.username;
  const idContent = isLoading ? <span className={styles.skeletonId} /> : user.id;
  const avatarSrc = isLoading ? undefined : user.avatar;
  const rankConfig = getRankConfig(currentRank);
  const backgroundImage = rankConfig.backgroundImage;

  return (
    <div className={clsx(styles.info, className)}>
      <div className={clsx(styles.infoWrap, !backgroundImage && styles.fullWidth)}>
        <div className={styles.user}>
          <Avatar className={styles.avatar} avatar={avatarSrc} />
          <div className={styles.userData}>
            <p className={styles.userName}>{nameContent}</p>
            <p className={styles.userIdWrapper}>
              <span className={styles.userId}>{t('userInfo.uid')} </span>
              {idContent}
            </p>
          </div>
        </div>
        <UserAmountProgress isProfile={true} className={styles.userAmountProgress} />
      </div>
      {backgroundImage && <img className={styles.userInfoImage} src={backgroundImage} alt={t(rankConfig.labelKey)} />}
    </div>
  );
};
