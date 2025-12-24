import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';

import '@shared/styles/global.scss';
import i18n, { i18nConfig } from '@shared/lib/i18n/i18n';

import App from './App';

// Инициализируем i18n с react-i18next асинхронно
// Это гарантирует, что React контекст будет готов перед рендерингом компонентов
i18n.use(initReactI18next);

const initApp = async (): Promise<void> => {
  await i18n.init({
    ...i18nConfig,
    react: {
      useSuspense: false,
    },
  });

  // Рендерим приложение только после полной инициализации i18n
  const root = createRoot(document.getElementById('root')!);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

initApp().catch(err => {
  console.error('Ошибка инициализации приложения:', err);
});
