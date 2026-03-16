import type { DomainConfig, DomainsConfig } from '../vault/types';

import { DomainResolver } from './domainResolver';

const HOURS_IN_REFRESH_INTERVAL = 6;
const SECONDS_IN_HOUR = 3600;
const MILLISECONDS_IN_SECOND = 1000;

export class DomainConfigService {
  private domainResolver: DomainResolver;
  private config: DomainsConfig | null = null;
  private currentDomainConfig: DomainConfig | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInterval = HOURS_IN_REFRESH_INTERVAL * SECONDS_IN_HOUR * MILLISECONDS_IN_SECOND; // 6 часов

  constructor() {
    this.domainResolver = new DomainResolver();
  }

  /**
   * Инициализация сервиса - загрузка конфигурации с сервера
   */
  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      this.startAutoRefresh();
    } catch (error) {
      console.error('Failed to initialize domain config service:', error);
      throw error;
    }
  }

  /**
   * Загрузка конфигурации с сервера через API
   */
  async loadConfig(): Promise<void> {
    try {
      const response = await fetch('/api/domains/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Failed to load domain config: ${response.status} ${errorText}`);
      }

      const config = (await response.json()) as DomainsConfig;

      this.config = config;

      this.domainResolver.setConfig(config);
      this.currentDomainConfig = this.domainResolver.getCurrentDomainConfig();
      if (!this.currentDomainConfig) {
        console.warn(
          // eslint-disable-next-line max-len
          `No domain config found for hostname: ${this.domainResolver.getCurrentHostname()}. Using default domain: ${config.default_domain}`,
        );
        this.currentDomainConfig = this.domainResolver.getDomainConfigByName(config.default_domain);
      }
    } catch (error) {
      console.error('Failed to load domain config from server:', error);
      throw error;
    }
  }

  /**
   * Обновление конфигурации (для ручного вызова)
   */
  async refresh(): Promise<void> {
    await this.loadConfig();
  }

  /**
   * Запуск автоматического обновления конфигурации
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Обновляем конфигурацию каждые 6 часов (домены могут меняться несколько раз в день)
    this.refreshInterval = HOURS_IN_REFRESH_INTERVAL * SECONDS_IN_HOUR * MILLISECONDS_IN_SECOND;

    this.refreshTimer = setTimeout(() => {
      this.refresh().catch(err => {
        console.error('Failed to refresh domain config:', err);
      });
      this.startAutoRefresh(); // Планируем следующее обновление
    }, this.refreshInterval);
  }

  /**
   * Получение конфигурации текущего домена
   */
  getCurrentDomainConfig(): DomainConfig | null {
    return this.currentDomainConfig;
  }

  /**
   * Получение BFF хоста для текущего домена
   */
  getBffHost(): string {
    return this.currentDomainConfig?.bff_host || '';
  }

  /**
   * Получение BFF URL для текущего домена
   */
  getBffUrl(): string {
    const host = this.getBffHost();

    return host ? `https://${host}` : '';
  }

  /**
   * Получение login хоста для текущего домена
   */
  getLoginHost(): string {
    return this.currentDomainConfig?.login_host || '';
  }

  /**
   * Получение login URL для текущего домена
   */
  getLoginUrl(): string {
    const host = this.getLoginHost();

    return host ? `https://${host}` : '';
  }

  /**
   * Получение списка разрешенных хостов для возврата после логина
   */
  getLoginReturnHosts(): string[] {
    return this.currentDomainConfig?.login_return_hosts || [];
  }

  /**
   * Получение имени Telegram бота для текущего домена
   */
  getTelegramBotName(): string {
    return this.currentDomainConfig?.tg_bot_name || 'skylon';
  }

  /**
   * Получение cookie домена для текущего домена
   */
  getCookieDomain(): string {
    return this.currentDomainConfig?.cookie_domain || '';
  }

  /**
   * Получение CSP настроек для текущего домена
   */
  getCspConfig(): DomainConfig['csp'] {
    return this.currentDomainConfig?.csp;
  }

  /**
   * Получение всех доменов
   */
  getAllDomains(): DomainConfig[] {
    return this.domainResolver.getAllDomains();
  }

  /**
   * Получение полной конфигурации
   */
  getConfig(): DomainsConfig | null {
    return this.config;
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Singleton instance
let domainConfigServiceInstance: DomainConfigService | null = null;

export const getDomainConfigService = (): DomainConfigService => {
  if (!domainConfigServiceInstance) {
    domainConfigServiceInstance = new DomainConfigService();
  }

  return domainConfigServiceInstance;
};
