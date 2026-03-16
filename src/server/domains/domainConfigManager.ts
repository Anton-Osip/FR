import type { DomainsConfig } from '@shared/services/vault/types';

import { getServerVaultClient } from '../vault/vaultClient';

/**
 * Менеджер конфигурации доменов на сервере
 * Загружает конфигурацию из Vault и кэширует её
 */

const HOURS_IN_REFRESH_INTERVAL = 6;
const SECONDS_IN_HOUR = 3600;
const MILLISECONDS_IN_SECOND = 1000;

export class ServerDomainConfigManager {
  private vaultClient = getServerVaultClient();
  private config: DomainsConfig | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInterval = HOURS_IN_REFRESH_INTERVAL * SECONDS_IN_HOUR * MILLISECONDS_IN_SECOND; // 6 часов

  /**
   * Инициализация менеджера - загрузка конфигурации из Vault
   */
  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      this.startAutoRefresh();
    } catch (error) {
      console.error('Failed to initialize server domain config manager:', error);
      throw error;
    }
  }

  /**
   * Загрузка конфигурации из Vault
   */
  async loadConfig(): Promise<void> {
    try {
      this.config = await this.vaultClient.getDomainsConfig();
    } catch (error) {
      console.error('Failed to load domain config from Vault:', error);
      throw error;
    }
  }

  /**
   * Получение конфигурации доменов
   */
  getConfig(): DomainsConfig | null {
    return this.config;
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

    this.refreshTimer = setTimeout(() => {
      this.refresh().catch(err => {
        console.error('Failed to refresh domain config:', err);
      });
      this.startAutoRefresh(); // Планируем следующее обновление
    }, this.refreshInterval);
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.vaultClient.destroy();
  }
}

// Singleton instance
let serverDomainConfigManagerInstance: ServerDomainConfigManager | null = null;

export const getServerDomainConfigManager = (): ServerDomainConfigManager => {
  if (!serverDomainConfigManagerInstance) {
    serverDomainConfigManagerInstance = new ServerDomainConfigManager();
  }

  return serverDomainConfigManagerInstance;
};
