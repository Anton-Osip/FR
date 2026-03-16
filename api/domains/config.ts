/* eslint-env node */
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getServerDomainConfigManager } from '../../src/server/domains/domainConfigManager';
import type { DomainConfig, DomainsConfig } from '../../src/shared/services/vault';

type PublicDomainConfig = Omit<DomainConfig, 'enabled'>;
type PublicDomainsConfig = Omit<DomainsConfig, 'domains'> & {
  domains: PublicDomainConfig[];
};

/**
 * Вспомогательная функция для безопасной отправки JSON ответа
 */
function sendJsonResponse(
  res: VercelResponse,
  statusCode: number,
  data: unknown,
  headers?: Record<string, string>,
): void {
  // Устанавливаем заголовки перед отправкой ответа
  res.setHeader('Content-Type', 'application/json');
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }
  res.status(statusCode).json(data);
}

/**
 * Vercel serverless function для предоставления конфигурации доменов
 * Обрабатывает GET запросы к /api/domains/config
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Убеждаемся, что всегда возвращаем JSON, даже при ошибках
  // Устанавливаем заголовки сразу, чтобы гарантировать JSON ответ
  res.setHeader('Content-Type', 'application/json');

  try {
    // Разрешаем только GET запросы
    if (req.method !== 'GET') {
      // eslint-disable-next-line no-magic-numbers
      sendJsonResponse(res, 405, { error: 'Method not allowed' });

      return;
    }

    let manager;

    try {
      manager = getServerDomainConfigManager();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('Failed to get domain config manager:', {
        message: errorMessage,
        stack: errorStack,
        error,
      });
      sendJsonResponse(res, 500, {
        error: 'Failed to initialize domain config manager',
        details: errorMessage,
      });

      return;
    }

    // Инициализируем менеджер, если еще не инициализирован
    // В serverless окружении это будет происходить при каждом холодном старте
    try {
      if (!manager.getConfig()) {
        await manager.initialize();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('Failed to initialize domain config manager:', {
        message: errorMessage,
        stack: errorStack,
        error,
      });
      sendJsonResponse(res, 500, {
        error: 'Failed to initialize domain config',
        details: errorMessage,
      });

      return;
    }

    const config = manager.getConfig();

    if (!config) {
      sendJsonResponse(res, 500, { error: 'Domain config not available' });

      return;
    }

    // Фильтруем конфигурацию для клиента — возвращаем только enabled домены
    // и только необходимые поля (без внутренних данных)
    const publicConfig: PublicDomainsConfig = {
      default_domain: config.default_domain,
      domains: config.domains
        .filter(d => d.enabled)
        .map(d => ({
          bff_host: d.bff_host,
          login_host: d.login_host,
          login_return_hosts: d.login_return_hosts,
          tg_bot_name: d.tg_bot_name,
          web_host: d.web_host,
          cookie_domain: d.cookie_domain,
          csp: d.csp,
          name: d.name,
        })),
      version: config.version,
    };

    sendJsonResponse(res, 200, publicConfig, {
      'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час
      'Access-Control-Allow-Origin': '*', // В production заменить на конкретные домены
      'Access-Control-Allow-Methods': 'GET',
    });
  } catch (error) {
    // Последний уровень защиты - обрабатываем любые неожиданные ошибки
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Unexpected error in domain config handler:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });
    // Убеждаемся, что заголовок установлен перед отправкой ответа
    if (!res.headersSent) {
      sendJsonResponse(res, 500, {
        error: 'Internal server error',
        details: errorMessage,
      });
    } else {
      // Если заголовки уже отправлены, пытаемся отправить JSON напрямую
      try {
        res.status(500).json({
          error: 'Internal server error',
          details: errorMessage,
        });
      } catch (sendError) {
        console.error('Failed to send error response:', sendError);
      }
    }
  }
}
