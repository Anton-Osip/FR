import type { FC } from 'react';

import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/constants/constants';
import { Avatar, Brand, Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import { BalanceCard } from './BalanceCard/BalanceCard';
import styles from './Header.module.scss';

import { useAuthStore } from '@/features/auth/authStore.ts';

interface HeaderProps {
  className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const { me } = useAuthStore();

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.container}>
        <Brand />
        <div className={styles.wrapper}>
          <BalanceCard balance={me?.balance} />
          <Avatar avatar={me?.avatar_url} name={me?.username} userFirstname={me?.user_firstname} />
          <Button variant={'ghost'} className={styles.chevronHeader} onClick={() => navigate(APP_PATH.profile)}>
            <ChevronHeaderIcon />
          </Button>
        </div>
      </div>
    </header>
  );
};
