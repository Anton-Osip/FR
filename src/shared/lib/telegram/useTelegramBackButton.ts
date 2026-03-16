import { useEffect, useRef, useCallback } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

// Выносим импорт за пределы компонента для избежания дублирования
let webAppPromise: Promise<typeof import('@twa-dev/sdk').default> | null = null;

const getWebApp = (): Promise<typeof import('@twa-dev/sdk').default> => {
  if (!webAppPromise) {
    webAppPromise = import('@twa-dev/sdk').then(module => module.default);
  }

  return webAppPromise;
};

export const useTelegramBackButton = (): void => {
  const navigate = useNavigate();
  const location = useLocation();

  // Используем ref для хранения обработчика и WebApp
  const backButtonHandlerRef = useRef<(() => void) | null>(null);
  const webAppRef = useRef<typeof import('@twa-dev/sdk').default>(null);

  const handleBackClick = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  // Оптимизированный эффект для back button
  useEffect(() => {
    let isMounted = true;

    const setupBackButton = async (): Promise<void> => {
      try {
        const WebApp = await getWebApp();

        if (!WebApp?.BackButton || !isMounted) return;

        // Сохраняем ссылку на WebApp
        webAppRef.current = WebApp;

        // Более надежная проверка возможности навигации назад
        const canGoBack = window.history.length > 1 && location.key !== 'default';

        if (canGoBack) {
          // Убираем предыдущий обработчик если был
          if (backButtonHandlerRef.current) {
            WebApp.BackButton.offClick(backButtonHandlerRef.current);
          }

          WebApp.BackButton.show();
          WebApp.BackButton.onClick(handleBackClick);
          backButtonHandlerRef.current = handleBackClick;
        } else {
          WebApp.BackButton.hide();
        }
      } catch (error) {
        console.error('Failed to setup Telegram back button:', error);
      }
    };

    void setupBackButton();

    return () => {
      isMounted = false;

      if (webAppRef.current?.BackButton && backButtonHandlerRef.current) {
        webAppRef.current.BackButton.offClick(backButtonHandlerRef.current);
        webAppRef.current.BackButton.hide();
        backButtonHandlerRef.current = null;
      }
    };
  }, [navigate, location, handleBackClick]);
};
