import { type FC } from 'react';

import './App.scss';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

import { MainLayout } from '@app/layouts/MainLayout';

import { Bonuses } from '@pages/bonuses';
import { Favorites } from '@pages/favorites';
import { HomePage } from '@pages/home';
import { Invite } from '@pages/invite';
import { Profile } from '@pages/profile';

import { LOGIN_HOSTNAME, LOGIN_ORIGIN, TELEGRAM_BOT_NAME } from '@shared/config/constants.ts';
import { APP_PATH } from '@shared/constants/constants';

import { TelegramLoginWidget } from '@widgets/TelegramLoginWidget.tsx';

import { useAuthFlow } from '@/features/auth/useAuthFlow.ts';
import { Preloader } from '@/widgets';

const App: FC = () => {
  const { authStatus, errorMessage, me, mode, showSiteLogin } = useAuthFlow();

  const showError = authStatus === 'error' && !!errorMessage;

  const isLoginHost = typeof window !== 'undefined' && !!LOGIN_HOSTNAME && window.location.hostname === LOGIN_HOSTNAME;

  const goToLogin = (): void => {
    if (typeof window === 'undefined') return;
    const u = new URL(LOGIN_ORIGIN);

    u.pathname = '/';
    u.searchParams.set('return_to', window.location.href);
    window.location.assign(u.toString());
  };

  const content = (() => {
    if (mode === 'unknown') {
      console.log('Определяем формат запуска...');

      return <Preloader />;
    }

    if (authStatus === 'checking') {
      console.log(mode === 'webapp' ? 'Вход через Telegram...' : 'Проверка аутентификации...');

      return <Preloader />;
    }

    if (authStatus === 'authenticated' && me) {
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
    }
    console.log(
      mode === 'webapp'
        ? 'Откройте приложение внутри Telegram, чтобы автоматически войти'
        : 'Добро пожаловать! Войдите через Telegram для продолжения',
    );

    return (
      <>
        <h1>Skylon</h1>
        <p>
          {mode === 'webapp'
            ? 'Откройте приложение внутри Telegram, чтобы автоматически войти'
            : 'Добро пожаловать! Войдите через Telegram для продолжения'}
        </p>

        {showError && <div>{errorMessage}</div>}

        {mode === 'webapp' ? (
          <div>
            <div>Если вы открыли страницу как обычный сайт — используйте вход через виджет ниже.</div>
            <div>
              <button onClick={() => showSiteLogin()}>Показать вход для сайта</button>
            </div>
          </div>
        ) : (
          <div>
            {isLoginHost ? (
              <TelegramLoginWidget botName={TELEGRAM_BOT_NAME} />
            ) : (
              <button onClick={() => goToLogin()}>Войти через Telegram</button>
            )}
          </div>
        )}

        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
          Нажимая кнопку, вы соглашаетесь с условиями использования
        </p>
      </>
    );
  })();

  return <> {content}</>;
};

export default App;
