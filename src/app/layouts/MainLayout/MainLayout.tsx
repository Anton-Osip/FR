import { type FC, useEffect, useRef, useState } from 'react';

import { ChevronUpIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { initLogging } from '@shared/telemetry';
import { Button } from '@shared/ui';

import styles from './MainLayout.module.scss';

import { Header, Sidebar, TabScreenMenu, Footer } from '@/widgets';

const SCROLL_THRESHOLD = 300;

export const MainLayout: FC = () => {
  const { t } = useTranslation('tabScreenMenu');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const scrollToTop = (): void => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    initLogging();
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) return;

    const handleScroll = (): void => {
      setShowScrollTop(mainElement.scrollTop > SCROLL_THRESHOLD);
    };

    mainElement.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.layout}>
      <Header className={styles.headerLayout} />
      <Sidebar className={styles.sidebarLayout} />
      <main ref={mainRef} className={styles.layoutMain}>
        <div className={styles.layoutMainContainer}>
          <Outlet />
        </div>
        <Footer />
      </main>
      <TabScreenMenu className={styles.tabScreenMenu} />
      {showScrollTop && (
        <Button
          variant="secondary"
          square
          icon={ChevronUpIcon}
          onClick={scrollToTop}
          className={styles.scrollTopButton}
          aria-label={t('scrollTop.ariaLabel')}
        />
      )}
    </div>
  );
};
