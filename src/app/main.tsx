import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';

import '@shared/styles/global.scss';

import { store } from '@app/store';

import i18n, { i18nConfig } from '@shared/lib/i18n/i18n.ts';

import App from './App.tsx';

i18n.use(initReactI18next);

const initApp = async (): Promise<void> => {
  await i18n.init({
    ...i18nConfig,
    react: {
      useSuspense: false,
    },
  });

  const root = createRoot(document.getElementById('root')!);

  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  );
};

initApp().catch(err => {
  console.error('Ошибка инициализации приложения:', err);
});
