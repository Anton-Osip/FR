import { getDomainConfigService } from '@shared/services/domains';
import type { DomainConfig } from '@shared/services/domains';

/**
 * Получение BFF URL для текущего домена
 */
export const getBff = (): string => {
  const service = getDomainConfigService();

  return service.getBffUrl();
};

/**
 * Получение BFF хоста для текущего домена
 */
export const getBffHost = (): string => {
  const service = getDomainConfigService();

  return service.getBffHost();
};

/**
 * Получение login URL для текущего домена
 */
export const getLoginOrigin = (): string => {
  const service = getDomainConfigService();

  return service.getLoginUrl();
};

/**
 * Получение login хоста для текущего домена
 */
export const getLoginHostname = (): string => {
  const service = getDomainConfigService();

  return service.getLoginHost();
};

/**
 * Получение списка разрешенных хостов для возврата после логина
 */
export const getLoginReturnHosts = (): string[] => {
  const service = getDomainConfigService();

  return service.getLoginReturnHosts();
};

/**
 * Получение имени Telegram бота для текущего домена
 */
export const getTelegramBotName = (): string => {
  const service = getDomainConfigService();

  return service.getTelegramBotName();
};

/**
 * Получение cookie домена для текущего домена
 */
export const getCookieDomain = (): string => {
  const service = getDomainConfigService();

  return service.getCookieDomain();
};

/**
 * Получение CSP настроек для текущего домена
 */
export const getCspConfig = (): DomainConfig['csp'] | undefined => {
  const service = getDomainConfigService();

  return service.getCspConfig();
};
