import { type FC, Suspense, type ReactNode } from 'react';

import { useLocation } from 'react-router-dom';

import { Preloader } from '@widgets/preloader';

import styles from './SuspenseWithKey.module.scss';

interface Props {
  children: ReactNode;
}

/**
 * Компонент-обертка для Suspense с ключом на основе location.
 * Это гарантирует размонтирование старого компонента при навигации,
 * что позволяет корректно обрабатывать состояние lazy-загруженных компонентов.
 */
export const SuspenseWithKey: FC<Props> = ({ children }) => {
  const location = useLocation();

  return (
    <Suspense key={location.pathname} fallback={<Preloader className={styles.fallbackPreloader} />}>
      {children}
    </Suspense>
  );
};
