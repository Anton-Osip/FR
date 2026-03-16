import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import '@shared/styles/global.scss';

import { store } from '@app/store';

import { ChunkErrorBoundary } from '@shared/lib/ChunkErrorBoundary';
import i18n, { i18nConfig } from '@shared/lib/i18n/i18n.ts';
import { getDomainConfigService } from '@shared/services/domains';

import App from './App.tsx';
import { InitErrorPage } from './InitErrorPage.tsx';

i18n.use(initReactI18next);

const initApp = async (): Promise<void> => {
  let initError: Error | unknown = null;

  try {
    const domainConfigService = getDomainConfigService();

    await domainConfigService.initialize();
    console.log('Domain configuration loaded successfully');
  } catch (error) {
    console.error('Не удалось инициализировать конфигурацию доменов:', error);
    initError = error;
  }

  await i18n.init({
    ...i18nConfig,
    react: {
      useSuspense: false,
    },
  });

  const root = createRoot(document.getElementById('root')!);

  root.render(
    <StrictMode>
      <ChunkErrorBoundary>
        {initError ? (
          <InitErrorPage />
        ) : (
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        )}
      </ChunkErrorBoundary>
    </StrictMode>,
  );
};

initApp().catch(err => {
  console.error('Ошибка инициализации приложения:', err);
});
