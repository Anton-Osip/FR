import { type FC, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { initLogging } from '@shared/lib';
import { Button } from '@shared/ui';
import { ArrowIcon, SupportIcon } from '@shared/ui/icons';

import { Footer } from '@widgets/footer';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';
import { TabScreenMenu } from '@widgets/tabScreenMenu';

import styles from './MainLayout.module.scss';

const SCROLL_THRESHOLD = 300;

interface Props {
  fullWidthContent?: boolean;
  withoutFooter?: boolean;
}

export const MainLayout: FC<Props> = ({ fullWidthContent, withoutFooter }) => {
  const { t } = useTranslation('tabScreenMenu');
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const scrollToTop = (): void => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    initLogging();
  }, []);

  useEffect(() => {
    // Скролл вверх при изменении маршрута
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

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
      <Sidebar className={styles.sidebarLayout} />
      <main ref={mainRef} className={styles.layoutMain}>
        <Header className={styles.headerLayout} />
        <div className={clsx(!fullWidthContent && styles.layoutMainContainer)}>
          <Outlet />
        </div>
        {!withoutFooter && <Footer />}
        <div className={styles.fixedButton}>
          <Button
            variant="tertiary"
            onClick={scrollToTop}
            className={clsx(styles.scrollTopButton, showScrollTop && styles.scrollTopButtonVisible)}
            size={'s'}
            aria-label={t('scrollTop.ariaLabel')}
            tabIndex={showScrollTop ? 0 : -1}
          >
            <span className={styles.scrollUpBtnContent}>
              <ArrowIcon />
              <span>{t('scrollTop.label')}</span>
            </span>
          </Button>
          {!withoutFooter && (
            <Button
              icon={<SupportIcon />}
              variant="primary"
              onClick={() => {
                // TODO: implement support chat
                console.warn('Support functionality not implemented yet');
              }}
              className={styles.supportBtn}
              size={'s'}
              aria-label={t('support.ariaLabel')}
            />
          )}
        </div>
      </main>
      <TabScreenMenu className={styles.tabScreenMenu} />
    </div>
  );
};
