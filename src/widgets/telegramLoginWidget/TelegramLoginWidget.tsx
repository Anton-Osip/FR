import { type FC, useEffect } from 'react';

import { feLog } from '@shared/lib';
import type { TelegramLoginWidgetProps } from '@shared/model/types';
import { FrostyIcon } from '@shared/ui/icons';

import styles from './TelegramLoginWidget.module.scss';

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

  return (
    <div className={styles.tgWidget}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.frostyIcon}>
            <FrostyIcon />
          </div>
          <span className={styles.text}>Frosty</span>
        </div>
      </header>
      <div id="telegram-login-widget" />
    </div>
  );
};
