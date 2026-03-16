import { FC, ReactNode, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';

import { Preloader } from '@widgets/preloader';

import styles from './RequireAuth.module.scss';
type Props = {
  children: ReactNode;
};

export const RequireAuth: FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(APP_PATH.main);
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return <Preloader className={styles.preloader} />;
  }

  return <>{children}</>;
};
