/* eslint-env node */
/* global process */
import dotenv from 'dotenv';
import { request } from 'undici';

import type {
  DomainsConfig,
  VaultAuthResponse,
  VaultKVResponse,
  VaultRenewResponse,
} from '@shared/services/vault/types';

// Константы для работы с временем
const SECONDS_IN_HOUR = 3600;
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_DAY = 86400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

// Загружаем переменные окружения из .env файла
// dotenv автоматически ищет .env в process.cwd()
dotenv.config();

/**
 * Серверный клиент для работы с Vault
 * Работает только на сервере (Node.js окружение)
 */
export class ServerVaultClient {
  private vaultAddr: string;
  private approleMount: string;
  private roleId: string;
  private secretId: string;
  private kvMount: string;
  private kvPrefix: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private renewTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Используем переменные окружения без префикса VITE_ для серверного кода
    this.vaultAddr = process.env.VAULT_ADDR || '';
    this.approleMount = process.env.VAULT_APPROLE_MOUNT || '';
    this.roleId = process.env.VAULT_ROLE_ID || '';
    this.secretId = process.env.VAULT_SECRET_ID || '';
    this.kvMount = process.env.VAULT_KV_MOUNT || 'kv';
    this.kvPrefix = process.env.VAULT_KV_PREFIX || 'skylon_domains';
  }
  /**
   * Аутентификация через AppRole
   */
  async login(): Promise<string | null> {
    if (!this.vaultAddr || !this.approleMount || !this.roleId || !this.secretId) {
      throw new Error('Vault credentials not configured');
    }

    const url = `${this.vaultAddr}/v1/auth/${this.approleMount}/login`;
    const requestBody = {
      role_id: this.roleId,
      secret_id: this.secretId,
    };

    // Проверяем, что мы на сервере
    if (typeof window !== 'undefined') {
      throw new Error('ServerVaultClient can only be used on the server side');
    }

    // Используем undici для точного контроля над запросом, как в curl
    const { statusCode, body } = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await body.text();

    if (statusCode !== 200) {
      let errorDetails: unknown;

      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }

      console.error('Vault login failed:', {
        status: statusCode,
        error: errorDetails,
        url,
        approleMount: this.approleMount,
      });

      throw new Error(`Vault login failed: ${statusCode} ${JSON.stringify(errorDetails)}`);
    }

    const data = JSON.parse(responseText) as VaultAuthResponse;

    this.token = data.auth.client_token;
    // Устанавливаем время истечения токена (lease_duration в секундах)
    // Вычитаем 1 час для безопасности
    this.tokenExpiry = Date.now() + (data.auth.lease_duration - SECONDS_IN_HOUR) * MILLISECONDS_IN_SECOND;

    // Запускаем автоматическое обновление токена
    this.scheduleTokenRenewal(data.auth.lease_duration);

    return this.token;
  }

  /**
   * Обновление токена
   */
  async renewToken(): Promise<void> {
    if (!this.token) {
      throw new Error('No token to renew');
    }

    // Проверяем, что мы на сервере
    if (typeof window !== 'undefined') {
      throw new Error('ServerVaultClient can only be used on the server side');
    }

    const url = `${this.vaultAddr}/v1/auth/token/renew-self`;
    const { statusCode, body } = await request(url, {
      method: 'POST',
      headers: {
        'X-Vault-Token': this.token,
      },
    });

    const responseText = await body.text();

    if (statusCode !== 200) {
      // Если обновление не удалось, пробуем залогиниться заново
      if (statusCode === HTTP_UNAUTHORIZED || statusCode === HTTP_FORBIDDEN) {
        await this.login();

        return;
      }

      throw new Error(`Vault token renewal failed: ${statusCode} ${responseText}`);
    }

    const data = JSON.parse(responseText) as VaultRenewResponse;

    this.token = data.auth.client_token;
    this.tokenExpiry = Date.now() + (data.auth.lease_duration - SECONDS_IN_HOUR) * MILLISECONDS_IN_SECOND;

    // Перепланируем обновление
    this.scheduleTokenRenewal(data.auth.lease_duration);
  }

  /**
   * Планирование обновления токена (минимум раз в день)
   */
  private scheduleTokenRenewal(leaseDurationSeconds: number): void {
    if (this.renewTimer) {
      clearTimeout(this.renewTimer);
    }

    // Обновляем токен минимум раз в день (86400 секунд)
    // Или за 1 час до истечения, если срок меньше дня
    const renewInterval = Math.min(
      SECONDS_IN_DAY * MILLISECONDS_IN_SECOND,
      (leaseDurationSeconds - SECONDS_IN_HOUR) * MILLISECONDS_IN_SECOND,
    );

    this.renewTimer = setTimeout(() => {
      this.renewToken().catch(err => {
        console.error('Failed to renew Vault token:', err);
        // Пробуем еще раз через час
        this.renewTimer = setTimeout(() => {
          this.renewToken().catch(console.error);
        }, SECONDS_IN_HOUR * MILLISECONDS_IN_SECOND);
      });
    }, renewInterval);
  }

  /**
   * Получение токена (с автоматической аутентификацией при необходимости)
   */
  async getToken(): Promise<string> {
    // Если токена нет или он истек, логинимся заново
    if (!this.token || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
      await this.login();
    }

    return this.token!;
  }

  /**
   * Чтение секрета из KV
   */
  async readSecret<T = unknown>(path: string): Promise<T> {
    const token = await this.getToken();
    // Путь должен быть: kv/data/stable/skylon_domains согласно документации
    const url = `${this.vaultAddr}/v1/${this.kvMount}/data/stable/${path}`;

    const { statusCode, body } = await request(url, {
      method: 'GET',
      headers: {
        'X-Vault-Token': token,
      },
    });

    const responseText = await body.text();

    if (statusCode !== 200) {
      let errorDetails: unknown;

      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }

      console.error('Vault read failed:', {
        status: statusCode,
        url,
        error: errorDetails,
      });

      throw new Error(`Vault read failed: ${statusCode} ${JSON.stringify(errorDetails)}`);
    }

    const data = JSON.parse(responseText) as VaultKVResponse<T>;

    return data.data.data;
  }

  /**
   * Получение конфигурации доменов
   */
  async getDomainsConfig(): Promise<DomainsConfig> {
    return this.readSecret<DomainsConfig>(this.kvPrefix);
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    if (this.renewTimer) {
      clearTimeout(this.renewTimer);
      this.renewTimer = null;
    }
    this.token = null;
    this.tokenExpiry = null;
  }
}

// Singleton instance для сервера
let serverVaultClientInstance: ServerVaultClient | null = null;

export const getServerVaultClient = (): ServerVaultClient => {
  if (!serverVaultClientInstance) {
    serverVaultClientInstance = new ServerVaultClient();
  }

  return serverVaultClientInstance;
};
