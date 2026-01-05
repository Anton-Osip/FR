import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { selectIsLoggedIn, selectMe } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { Avatar, Brand, Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import { BalanceCard } from '../BalanceCard/BalanceCard';

import styles from './Header.module.scss';

import { LoginModal } from '@/widgets';

interface HeaderProps {
  className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  const { t } = useTranslation('header');
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const me = useAppSelector(selectMe);
  const avatar_url = me?.avatar_url;
  const user_name = me?.user_name;
  const user_firstname = me?.user_firstname;

  return (
    <header className={clsx(styles.header, className)}>
      <div className={styles.container}>
        <Brand />
        {isLoggedIn ? (
          <div className={styles.authenticatedWrapper}>
            <BalanceCard />
            <Avatar avatar={avatar_url} name={user_name} userFirstname={user_firstname} />
            <Button
              variant={'ghost'}
              className={styles.chevronHeader}
              onClick={() => navigate(APP_PATH.profile)}
              aria-label={t('goToProfile')}
              title={t('goToProfile')}
            >
              <ChevronHeaderIcon />
            </Button>
          </div>
        ) : (
          <div className={styles.unauthenticatedWrapper}>
            <LoginModal
              trigger={
                <Button variant={'primary'} className={styles.signUp} aria-label={t('login')}>
                  {t('login')}
                </Button>
              }
            />
          </div>
        )}
      </div>
    </header>
  );
};
