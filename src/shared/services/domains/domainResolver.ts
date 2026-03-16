import type { DomainConfig, DomainsConfig } from '../vault/types';

export class DomainResolver {
  private config: DomainsConfig | null = null;

  /**
   * Установка конфигурации доменов
   */
  setConfig(config: DomainsConfig): void {
    this.config = config;
  }

  /**
   * Получение текущего домена из window.location
   */
  getCurrentHostname(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.hostname;
  }

  /**
   * Определение конфигурации для текущего домена
   */
  getCurrentDomainConfig(): DomainConfig | null {
    if (!this.config) {
      return null;
    }
    const hostname = this.getCurrentHostname();

    // Ищем точное совпадение по web_host
    let domainConfig = this.config.domains.find(d => d.web_host === hostname);

    // Если не нашли, ищем по login_host
    if (!domainConfig) {
      domainConfig = this.config.domains.find(d => d.login_host === hostname);
    }

    // Если все еще не нашли, проверяем origins
    if (!domainConfig) {
      domainConfig = this.config.domains.find(d => {
        if (!d.origins) {
          return false;
        }

        return d.origins.some(origin => {
          try {
            const originUrl = new URL(origin);

            return originUrl.hostname === hostname;
          } catch {
            return origin === hostname;
          }
        });
      });
    }

    // Если ничего не нашли, используем default_domain
    if (!domainConfig) {
      domainConfig = this.config.domains.find(d => d.name === this.config!.default_domain);
    }

    return domainConfig ? domainConfig : null;
  }

  /**
   * Получение конфигурации по имени домена
   */
  getDomainConfigByName(name: string): DomainConfig | null {
    if (!this.config) {
      return null;
    }

    const domainConfig = this.config.domains.find(d => d.name === name && d.enabled);

    return domainConfig || null;
  }

  /**
   * Получение всех доступных доменов
   */
  getAllDomains(): DomainConfig[] {
    if (!this.config) {
      return [];
    }

    return this.config.domains.filter(d => d.enabled);
  }

  /**
   * Получение полной конфигурации
   */
  getConfig(): DomainsConfig | null {
    return this.config;
  }
}
