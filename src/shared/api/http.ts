import type { ApiErrorBody, FetchJsonResult } from '@/shared/schemas';
import { feLog } from '@/shared/telemetry/feLogger';
export type { ApiErrorBody, FetchJsonResult } from '@/shared/schemas';

const RANDOM_RADIX = 36;
const RANDOM_SLICE_START = 2;
const RANDOM_SLICE_END = 10;
// eslint-disable-next-line no-magic-numbers
const CLIENT_PROFILE_MIN_INTERVAL_MS = 30 * 60 * 1000;
const CLIENT_PROFILE_SAMPLE_RATE = 0.08;
const FETCH_TIMEOUT_MS = 10000;

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
  const minIntervalMs = CLIENT_PROFILE_MIN_INTERVAL_MS;

  if (now - last < minIntervalMs) return headers;
  if (Math.random() >= CLIENT_PROFILE_SAMPLE_RATE) return headers;
  try {
    const [{ collectClientProfilePayload }, { CLIENT_VERSION }] = await Promise.all([
      import('@/shared/fingerprint'),
      import('@/shared/config/constants'),
    ]);
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

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));

  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Типизированный JSON fetch c request-id, таймаутом и единым контрактом ошибки.
 * Не выбрасывает исключения наружу: ошибки возвращаются через `ok: false`.
 */
export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<FetchJsonResult<T>> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  const reqId = genReqId();

  try {
    feLog.debug('http.request', {
      reqId,
      url,
      method: init?.method || 'GET',
      hasBody: !!init?.body,
    });
    const headersWithReqId = new Headers(init?.headers || {});

    headersWithReqId.set('x-request-id', reqId);
    const initWithReqId: RequestInit = {
      ...init,
      headers: headersWithReqId,
    };
    const headers = await maybeAttachClientProfile(url, initWithReqId);
    const res = await fetch(url, { ...initWithReqId, headers, signal: ac.signal });
    const contentType = res.headers.get('content-type') || '';
    const data: unknown = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '');

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
