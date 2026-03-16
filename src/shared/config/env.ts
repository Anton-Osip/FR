import { getDomainConfigService } from '@shared/services/domains';

/**
 * Получение BFF URL для текущего домена
 */
export const getBFF = (): string | undefined => {
  try {
    const service = getDomainConfigService();
    const url = service.getBffUrl();

    return url || undefined;
  } catch {
    /* empty */
  }
};

export const CLIENT_VERSION = import.meta.env.VITE_APP_VERSION || 'webapp/1';

/**
 * Получение имени Telegram бота для текущего домена
 */
export const getTelegramBotName = (): string | undefined => {
  try {
    const service = getDomainConfigService();
    const botName = service.getTelegramBotName();

    return botName || undefined;
  } catch {
    /* empty */
  }
};

/**
 * Получение login URL для текущего домена
 */
export const getLoginOrigin = (): string | undefined => {
  try {
    const service = getDomainConfigService();
    const url = service.getLoginUrl();

    return url || undefined;
  } catch {
    /* empty */
  }
};

/**
 * Получение login hostname для текущего домена
 */
export const getLoginHostname = (): string | undefined => {
  try {
    const service = getDomainConfigService();
    const host = service.getLoginHost();

    return host || undefined;
  } catch {
    /* empty */
  }
};

/**
 * Получение списка разрешенных хостов для возврата после логина
 */
export const getLoginReturnHosts = (): string[] | undefined => {
  try {
    const service = getDomainConfigService();
    const hosts = service.getLoginReturnHosts();

    return hosts.length > 0 ? hosts : undefined;
  } catch {
    /* empty */
  }
};
