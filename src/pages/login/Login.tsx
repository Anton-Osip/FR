import { type FC } from 'react';

import { LOGIN_HOSTNAME, LOGIN_ORIGIN, TELEGRAM_BOT_NAME } from '@shared/config/constants.ts';

import { ModePill } from '@widgets/modePill/ModePill.tsx';
import { TelegramLoginWidget } from '@widgets/telegramLoginWidget/TelegramLoginWidget.tsx';

import { useAuthFlow } from '@/features/auth/useAuthFlow.ts';

export const Login: FC = () => {
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
      return (
        <>
          <h1>Skylon</h1>
          <p>Определяем формат запуска...</p>
          <div>
            <div />
          </div>
        </>
      );
    }

    if (authStatus === 'checking') {
      return (
        <>
          <h1>Skylon</h1>
          <p>{mode === 'webapp' ? 'Вход через Telegram...' : 'Проверка аутентификации...'}</p>
          <div>
            <div />
          </div>
          <div>Пожалуйста, подождите</div>
        </>
      );
    }

    if (authStatus === 'authenticated' && me) {
      const balanceValue = me.balance;
      const balance =
        typeof balanceValue === 'number'
          ? balanceValue
          : balanceValue === null || balanceValue === undefined
            ? undefined
            : Number(balanceValue);

      return (
        <>
          <h1>Профиль пользователя</h1>
          <div>
            <div>
              <label>ID пользователя</label>
              <div>{me.user_id}</div>
            </div>

            {me.username && (
              <div>
                <label>Имя пользователя</label>
                <div>@{me.username}</div>
              </div>
            )}

            {typeof balance === 'number' && Number.isFinite(balance) && (
              <div>
                <label>Баланс</label>
                <div>{balance.toFixed(2)}</div>
              </div>
            )}
          </div>
        </>
      );
    }

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

        <p>Нажимая кнопку, вы соглашаетесь с условиями использования</p>
      </>
    );
  })();

  return (
    <main>
      <div>
        <div>
          <div>
            <ModePill mode={mode} />
          </div>
          {content}
        </div>
      </div>
    </main>
  );
};
