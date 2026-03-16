import { type FC, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { PollingManager } from '@app/PollingManager/PollingManager.tsx';
import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { useSafeArea } from '@shared/lib/hooks/useSafeArea.tsx';
import { Button } from '@shared/ui';
import { ArrowIcon } from '@shared/ui/icons';

import { AuthModal } from '@widgets/authModal';
import { Footer } from '@widgets/footer';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';
import { TabScreenMenu } from '@widgets/tabScreenMenu';

import styles from './MainLayout.module.scss';

import { useWalletModalUrl } from '@features/wallet/model';
import { WalletModal } from '@features/wallet/ui/WalletModal';

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
  const { isOpen: modalWalletIsOpen, closeModal: closeWalletModal } = useWalletModalUrl();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const showWalletModal = modalWalletIsOpen && isLoggedIn;
  const showAuthModal = modalWalletIsOpen && !isLoggedIn;

  const scrollToTop = (): void => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  const { isIOS, isMobile, isAndroid } = useSafeArea();

  return (
    <div className={clsx(styles.layout, isMobile && styles.mobile, isAndroid && styles.android, isIOS && styles.ios)}>
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
        </div>
      </main>
      <TabScreenMenu className={styles.tabScreenMenu} />
      <PollingManager />
      <WalletModal open={showWalletModal} onOpenChange={open => (open ? undefined : closeWalletModal())} />
      <AuthModal open={showAuthModal} onOpenChange={open => (open ? undefined : closeWalletModal())} />
    </div>
  );
};
