import { CLIENT_VERSION } from '@shared/config/env.ts';
import { collectClientProfilePayload } from '@shared/lib/fingerprint';
import { feLog } from '@shared/lib/telemetry/feLogger';
import type { ApiErrorBody, FetchJsonResult, NavigatorWithUserAgentData } from '@shared/model';

const RANDOM_RADIX = 36;
const RANDOM_SLICE_START = 2;
const RANDOM_SLICE_END = 10;
// eslint-disable-next-line no-magic-numbers
const CLIENT_PROFILE_MIN_INTERVAL_MS = 30 * 60 * 1000;
const CLIENT_PROFILE_SAMPLE_RATE = 0.08;
const FETCH_TIMEOUT_MS = 10000;

const RES_STATUS_ERROR_300 = 300;
const RES_STATUS_ERROR_400 = 400;

export const FETCH_TIMEOUT_EXTENDED_MS = 90000; // 90 секунд для долгих операций (фиат)

function b64url(buf: Uint8Array): string {
  const s = String.fromCharCode(...buf);

  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function genReqId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(RANDOM_RADIX)}-${Math.random()
      .toString(RANDOM_RADIX)
      .slice(RANDOM_SLICE_START, RANDOM_SLICE_END)}`;
  }
}

let lastProfileSentAt = 0;
const LS_KEY = 'skylon_cp_last_sent_at';

function attachDeviceHeaders(headers: Headers): void {
  if (typeof window === 'undefined') return;
  if (headers.has('x-client-profile')) return;

  try {
    const userAgent = navigator.userAgent || '';

    if (userAgent) {
      headers.set('x-user-ua', userAgent);
    }

    const nav = navigator as NavigatorWithUserAgentData;
    const uaData = nav.userAgentData;
    const platform = String(
      (uaData && typeof uaData.platform === 'string' ? uaData.platform : '') || navigator.platform || '',
    );

    if (platform) {
      headers.set('sec-ch-ua-platform', `"${platform}"`);
    }

    const USER_AGENT_MOBILE_RE = /Mobile|Android|iPhone|iPad|iPod/i;
    const uaMobile = !!uaData && uaData.mobile === true;
    const deviceType = USER_AGENT_MOBILE_RE.test(userAgent) || uaMobile ? 'mobile' : 'desktop';

    headers.set('x-device-type', deviceType);

    if (typeof screen !== 'undefined') {
      const screenRes = `${screen.width}x${screen.height}@${window.devicePixelRatio || 1}`;

      headers.set('x-device-screen', screenRes);
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    if (timezone) {
      headers.set('x-device-timezone', timezone);
    }
  } catch {
    /* empty */
  }
}

async function maybeAttachClientProfile(url: string, init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers || {});

  if (typeof window === 'undefined') return headers;
  if (headers.has('x-client-profile')) return headers;
  if (!String(url).includes('/api/v1/')) return headers;
  const method = (init?.method || 'GET').toUpperCase();

  if (method === 'OPTIONS') return headers;
  if (init?.credentials !== 'include') return headers;
  const now = Date.now();
  let last = lastProfileSentAt;

  try {
    const v = localStorage.getItem(LS_KEY);

    if (v) last = Number(v) || 0;
  } catch {
    /* noop */
  }

  if (now - last < CLIENT_PROFILE_MIN_INTERVAL_MS) return headers;
  if (Math.random() >= CLIENT_PROFILE_SAMPLE_RATE) return headers;
  try {
    const payload = await collectClientProfilePayload(CLIENT_VERSION);
    const json = JSON.stringify(payload);
    const enc = new TextEncoder();

    headers.set('x-client-profile', b64url(enc.encode(json)));
    lastProfileSentAt = now;
    try {
      localStorage.setItem(LS_KEY, String(now));
    } catch {
      /* noop */
    }
  } catch {
    /* noop */
  }

  return headers;
}

/**
 * Типизированный JSON fetch c request-id, таймаутом и единым контрактом ошибки.
 * Не выбрасывает исключения наружу: ошибки возвращаются через `ok: false`.
 */
export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<FetchJsonResult<T>> {
  const ac = new AbortController();

  // Проверяем, есть ли кастомный таймаут в заголовках
  const customTimeout =
    init?.headers && 'x-request-timeout' in init.headers
      ? Number((init.headers as Record<string, string>)['x-request-timeout'])
      : undefined;
  const timeout = customTimeout || FETCH_TIMEOUT_MS;

  const t = setTimeout(() => ac.abort(), timeout);
  const reqId = genReqId();

  try {
    feLog.debug('http.request', {
      reqId,
      url,
      method: init?.method || 'GET',
      hasBody: !!init?.body,
      timeout,
    });
    const headersWithReqId = new Headers(init?.headers || {});

    headersWithReqId.set('x-request-id', reqId);
    // Удаляем служебный заголовок, чтобы не отправлять его на сервер
    headersWithReqId.delete('x-request-timeout');
    const initWithReqId: RequestInit = {
      ...init,
      headers: headersWithReqId,
    };
    const headers = await maybeAttachClientProfile(url, initWithReqId);

    if (init?.credentials === 'include' && String(url).includes('/api/v1/')) {
      attachDeviceHeaders(headers);
    }

    const res = await fetch(url, { ...initWithReqId, headers, signal: ac.signal });

    // Проверяем статус редиректа (fetch автоматически следует редиректам, но проверяем на всякий случай)

    if (res.status >= RES_STATUS_ERROR_300 && res.status < RES_STATUS_ERROR_400) {
      feLog.warn('http.redirect_detected', {
        reqId,
        url,
        status: res.status,
        location: res.headers.get('location'),
      });
    }

    const contentType = res.headers.get('content-type') || '';

    // Безопасный парсинг ответа с улучшенной обработкой ошибок
    let data: unknown;

    try {
      if (contentType.includes('application/json')) {
        const text = await res.text();

        // Проверяем, что ответ не пустой перед парсингом
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch {
            // Если парсинг JSON не удался, логируем и возвращаем пустой объект
            // Это предотвращает unhandled rejection, который может вызвать перезагрузку страницы
            feLog.warn('http.json_parse_error', {
              reqId,
              url,
              status: res.status,
              contentType,
              // eslint-disable-next-line no-magic-numbers
              textPreview: text.substring(0, 100),
            });
            data = {};
          }
        } else {
          data = {};
        }
      } else {
        data = await res.text().catch(() => '');
      }
    } catch (parseError) {
      // Дополнительная защита от любых ошибок парсинга
      // Это критически важно для предотвращения unhandled rejection
      feLog.warn('http.parse_error', {
        reqId,
        url,
        status: res.status,
        contentType,
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      data = {};
    }

    feLog.debug('http.response', { reqId, url, status: res.status, ok: res.ok });
    if (res.ok) return { ok: true, status: res.status, requestId: reqId, data: data as T };
    const errData = (data && typeof data === 'object' ? data : {}) as ApiErrorBody;

    return { ok: false, status: res.status, requestId: reqId, data: errData };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    feLog.error('http.error', { reqId, url, error: msg });

    return {
      ok: false,
      status: 0,
      requestId: reqId,
      data: { error: 'network_error', detail: msg },
    };
  } finally {
    clearTimeout(t);
  }
}
