import { type FC, lazy, useEffect, useRef, useState } from 'react';

import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

import './App.scss';

import { MainLayout } from '@app/layouts';
import { SuspenseWithKey } from '@app/SuspenseWithKey';

import { LOGIN_HOSTNAME, TELEGRAM_BOT_NAME, APP_PATH } from '@shared/config';
import { RequireAuth } from '@shared/lib/hoc/RequireAuth';
import { ToasterPortal } from '@shared/ui';

import { Preloader } from '@widgets/preloader';
import { TelegramLoginWidget } from '@widgets/telegramLoginWidget';

import { useAuthFlow } from '@/features/auth';
import { showcaseApi } from '@/features/showcase/api/showcaseApi';
import { useAppDispatch } from '@/shared/api';
import { userApi } from '@entities/user';

// Lazy-loaded pages for code splitting
const PlayPage = lazy(() => import('@pages/play').then(m => ({ default: m.Play })));
const HomePage = lazy(() => import('@pages/home').then(m => ({ default: m.HomePage })));
const Bonuses = lazy(() => import('@pages/bonuses').then(m => ({ default: m.Bonuses })));
const Profile = lazy(() => import('@pages/profile').then(m => ({ default: m.Profile })));
const Invite = lazy(() => import('@pages/invite').then(m => ({ default: m.Invite })));
const Favorites = lazy(() => import('@pages/favorites').then(m => ({ default: m.Favorites })));
const Slots = lazy(() => import('@pages/slots').then(m => ({ default: m.Slots })));
const Slot = lazy(() => import('@pages/slot').then(m => ({ default: m.Slot })));

const WIDGET_CHECK_INTERVAL_MS = 100;
const WIDGET_CHECK_TIMEOUT_MS = 5000;

function checkWidgetLoaded(): boolean {
  const container = document.getElementById('telegram-login-widget');

  return container ? container.children.length > 0 : false;
}

const App: FC = () => {
  const { authStatus, mode } = useAuthFlow();
  const isLoginHost = typeof window !== 'undefined' && !!LOGIN_HOSTNAME && window.location.hostname === LOGIN_HOSTNAME;

  const [isWidgetLoaded, setIsWidgetLoaded] = useState(() => !isLoginHost);
  const prevIsLoginHostRef = useRef<boolean>(isLoginHost);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(userApi.util.prefetch('getUserGeoCountry', undefined, { ifOlderThan: 3600 }));
  }, [dispatch]);

  // Prefetch критических данных для главной страницы после успешной аутентификации
  useEffect(() => {
    if (authStatus === 'authenticated' || authStatus === 'unauthenticated') {
      // Эти данные нужны для HomePage, запускаем параллельно
      dispatch(showcaseApi.util.prefetch('getFeaturedSlot', { kind: 'weekly' }, { ifOlderThan: 60 }));
      dispatch(showcaseApi.util.prefetch('getShowcaseGames', { page_size: 20 }, { ifOlderThan: 60 }));
      dispatch(showcaseApi.util.prefetch('getBettingTableBetsLatest', { page_size: 10 }, { ifOlderThan: 10 }));
    }
  }, [authStatus, dispatch]);

  useEffect(() => {
    if (!isLoginHost) {
      prevIsLoginHostRef.current = false;

      return;
    }

    const wasNotLoginHost = !prevIsLoginHostRef.current;

    prevIsLoginHostRef.current = true;

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (wasNotLoginHost) {
        setIsWidgetLoaded(false);
      }

      if (checkWidgetLoaded()) {
        setIsWidgetLoaded(true);
        clearInterval(checkInterval);
      } else if (Date.now() - startTime > WIDGET_CHECK_TIMEOUT_MS) {
        setIsWidgetLoaded(true);
        clearInterval(checkInterval);
      }
    }, WIDGET_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(checkInterval);
    };
  }, [isLoginHost]);

  if (mode === 'unknown' || authStatus === 'checking') {
    return <Preloader />;
  }

  if (isLoginHost) {
    if (!isWidgetLoaded) {
      return <Preloader />;
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <TelegramLoginWidget botName={TELEGRAM_BOT_NAME} autoClick={true} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            index
            element={
              <SuspenseWithKey>
                <HomePage />
              </SuspenseWithKey>
            }
          />
          <Route
            path={APP_PATH.bonuses}
            element={
              <RequireAuth>
                <SuspenseWithKey>
                  <Bonuses />
                </SuspenseWithKey>
              </RequireAuth>
            }
          />
          <Route
            path={APP_PATH.profile}
            element={
              <RequireAuth>
                <SuspenseWithKey>
                  <Profile />
                </SuspenseWithKey>
              </RequireAuth>
            }
          />
          <Route
            path={APP_PATH.invite}
            element={
              <RequireAuth>
                <SuspenseWithKey>
                  <Invite />
                </SuspenseWithKey>
              </RequireAuth>
            }
          />
          <Route
            path={APP_PATH.favorites}
            element={
              <RequireAuth>
                <SuspenseWithKey>
                  <Favorites />
                </SuspenseWithKey>
              </RequireAuth>
            }
          />
          <Route
            path={APP_PATH.slots}
            element={
              <SuspenseWithKey>
                <Slots />
              </SuspenseWithKey>
            }
          />

          <Route path="*" element={<Navigate to={APP_PATH.main} replace />} />
        </Route>
        <Route element={<MainLayout fullWidthContent={true} />}>
          <Route
            path={APP_PATH.slot}
            element={
              <SuspenseWithKey>
                <Slot />
              </SuspenseWithKey>
            }
          />
        </Route>
        <Route element={<MainLayout withoutFooter={true} fullWidthContent={true} />}>
          <Route
            path={APP_PATH.play}
            element={
              <SuspenseWithKey>
                <PlayPage />
              </SuspenseWithKey>
            }
          />
        </Route>
      </Routes>
      <ToasterPortal position="top-right" theme="dark" />
    </BrowserRouter>
  );
};

export default App;
