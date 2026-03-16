import { useEffect, useState } from 'react';
const TIMEOUT_DELAY = 100;

interface UseSafeAreaReturn {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
}

export const useSafeArea = (): UseSafeAreaReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const updateSafeArea = (): void => {
      import('@twa-dev/sdk')
        .then(module => {
          const WebApp = module.default;

          if (WebApp) {
            const mobile = WebApp.platform === 'android' || WebApp.platform === 'ios';

            setIsMobile(mobile);

            if (mobile) {
              const isAndroidPlatform = WebApp.platform === 'android';
              const isIOSPlatform = WebApp.platform === 'ios';

              setIsAndroid(isAndroidPlatform);
              setIsIOS(isIOSPlatform);

              const contentSafeArea = WebApp.contentSafeAreaInset;
              const safeArea = WebApp.safeAreaInset;
              const viewportStableHeight = WebApp.viewportStableHeight;

              const contentSafeAreaTop = contentSafeArea?.top || 0;
              const safeAreaTop = safeArea?.top || 0;

              let telegramHeaderHeight = 0;

              if (viewportStableHeight && viewportStableHeight > 0) {
                const windowHeight = window.innerHeight;

                telegramHeaderHeight = Math.max(windowHeight - viewportStableHeight, 0);
              } else {
                telegramHeaderHeight = Math.max(contentSafeAreaTop - safeAreaTop, 0);
              }

              if (isAndroidPlatform) {
                if (contentSafeAreaTop > 0) {
                  document.documentElement.style.setProperty('--tg-content-safe-area-top', `${contentSafeAreaTop}px`);
                }
                if (safeAreaTop > 0) {
                  document.documentElement.style.setProperty('--tg-safe-area-top', `${safeAreaTop}px`);
                }
                if (telegramHeaderHeight > 0) {
                  document.documentElement.style.setProperty('--tg-header-height', `${telegramHeaderHeight}px`);
                }
                document.body.classList.add('tg-mobile', 'tg-android');
                document.documentElement.classList.add('tg-mobile', 'tg-android');
              } else if (isIOSPlatform) {
                if (telegramHeaderHeight > 0) {
                  document.documentElement.style.setProperty('--tg-header-height', `${telegramHeaderHeight}px`);
                } else {
                  const defaultHeaderHeight = 56;

                  document.documentElement.style.setProperty('--tg-header-height', `${defaultHeaderHeight}px`);
                }
                if (safeAreaTop > 0) {
                  document.documentElement.style.setProperty('--tg-safe-area-top', `${safeAreaTop}px`);
                }
                document.body.classList.add('tg-mobile', 'tg-ios');
                document.documentElement.classList.add('tg-mobile', 'tg-ios');
              } else {
                document.body.classList.add('tg-mobile');
                document.documentElement.classList.add('tg-mobile');
              }
            }
          } else {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|iphone|ipad|ipod/i.test(userAgent);

            setIsMobile(isMobileDevice);
            if (isMobileDevice) {
              document.body.classList.add('tg-mobile');
              document.documentElement.classList.add('tg-mobile');
            }
          }
        })
        .catch(() => {
          const userAgent = navigator.userAgent.toLowerCase();
          const isMobileDevice = /android|iphone|ipad|ipod/i.test(userAgent);

          setIsMobile(isMobileDevice);
          if (isMobileDevice) {
            document.body.classList.add('tg-mobile');
            document.documentElement.classList.add('tg-mobile');
          }
        });
    };

    updateSafeArea();

    const timeoutId = setTimeout(updateSafeArea, TIMEOUT_DELAY);

    return () => {
      clearTimeout(timeoutId);
      import('@twa-dev/sdk')
        .then(module => {
          const WebApp = module.default;

          if (WebApp && typeof WebApp.offEvent === 'function') {
            WebApp.offEvent('contentSafeAreaChanged', updateSafeArea);
            WebApp.offEvent('safeAreaChanged', updateSafeArea);
            WebApp.offEvent('viewportChanged', updateSafeArea);
          }
        })
        .catch(() => {});
    };
  }, []);

  return { isMobile, isAndroid, isIOS };
};
