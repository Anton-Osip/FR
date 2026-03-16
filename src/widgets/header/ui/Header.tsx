import type { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { selectIsLoggedIn, selectMe } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { Avatar, Brand, Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import { AuthModal } from '@widgets/authModal';

import { BalanceCard } from '../BalanceCard/BalanceCard';

import styles from './Header.module.scss';

interface HeaderProps {
  className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  const { t } = useTranslation('header');

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const me = useAppSelector(selectMe);
  const avatar_url = me?.avatar_url;

  return (
    <header className={clsx(styles.header, className)}>
      <div className={styles.container}>
        <Brand />
        {isLoggedIn ? (
          <div className={styles.authenticatedWrapper}>
            <BalanceCard />
            <Link className={styles.link} aria-label={t('goToProfile')} to={APP_PATH.profile}>
              <Avatar avatar={avatar_url} />
              <ChevronHeaderIcon />
            </Link>
          </div>
        ) : (
          <div className={styles.unauthenticatedWrapper}>
            <AuthModal
              trigger={
                <Button variant={'primary'} className={styles.signUp} size={'s'} aria-label={t('login')}>
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
