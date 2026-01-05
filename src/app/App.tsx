import { type FC, useEffect, useRef, useState } from 'react';

import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

import './App.scss';

import { MainLayout } from '@app/layouts/MainLayout';

import { Bonuses } from '@pages/bonuses';
import { Favorites } from '@pages/favorites';
import { HomePage } from '@pages/home';
import { Invite } from '@pages/invite';
import { Profile } from '@pages/profile';

import { LOGIN_HOSTNAME, TELEGRAM_BOT_NAME } from '@shared/config/env.ts';
import { APP_PATH } from '@shared/config/routes.ts';

import { useAuthFlow } from '@/features/auth';
import { TelegramLoginWidget } from '@/widgets';
import { Preloader } from '@/widgets';

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
          <Route index element={<HomePage />} />
          <Route path={APP_PATH.bonuses} element={<Bonuses />} />
          <Route path={APP_PATH.profile} element={<Profile />} />
          <Route path={APP_PATH.invite} element={<Invite />} />
          <Route path={APP_PATH.favorites} element={<Favorites />} />
          <Route path="*" element={<Navigate to={APP_PATH.main} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
