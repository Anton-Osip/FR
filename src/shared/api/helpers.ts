import { feLog } from '@shared/lib';

export type BaseQueryFn = (args: { url: string; method: string; body?: unknown }) => Promise<{
  data?: unknown;
  error?: { status: number; data: unknown };
  meta?: { requestId?: string };
}>;

export interface ApiRequestConfig {
  endpointName: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  logData?: Record<string, unknown>;
}

export async function executeApiRequest<T>(
  config: ApiRequestConfig,
  baseQuery: BaseQueryFn,
): Promise<{ data: T } | { error: { status: number; data: unknown; error: string } }> {
  try {
    feLog.info(`${config.endpointName}.start`, config.logData);

    const result = await baseQuery({
      url: config.url,
      method: config.method,
      body: config.body,
    });

    if (result.error) {
      const errorData = result.error.data as { error?: string } | undefined;
      const requestId = result.meta?.requestId;

      feLog.warn(`${config.endpointName}.failed`, {
        requestId,
        status: result.error.status,
        error: errorData?.error,
        ...config.logData,
      });

      return {
        error: {
          status: result.error.status,
          data: result.error.data,
          error: errorData?.error || `${config.endpointName.replace(/\./g, '_')}_failed`,
        },
      };
    }

    const requestId = result.meta?.requestId;

    feLog.info(`${config.endpointName}.success`, {
      requestId,
      ...config.logData,
    });

    return { data: result.data as T };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    feLog.error(`${config.endpointName}.exception`, {
      error: msg,
      ...config.logData,
    });

    return {
      error: {
        status: 0,
        data: { error: 'network_error' },
        error: 'network_error',
      },
    };
  }
}
