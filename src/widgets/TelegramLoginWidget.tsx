import { type FC, useEffect } from 'react';

import type { TelegramLoginWidgetProps } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry/feLogger';

export const TelegramLoginWidget: FC<TelegramLoginWidgetProps> = ({ botName }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !botName) return;

    const container = document.getElementById('telegram-login-widget');

    if (!container) return;

    const script = document.createElement('script');

    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', window.location.origin + window.location.pathname + window.location.search);
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    container.innerHTML = '';
    container.appendChild(script);

    feLog.debug('telegram_login_widget.embedded', { botName });

    return () => {
      container.innerHTML = '';
    };
  }, [botName]);

  return <div id="telegram-login-widget" />;
};
