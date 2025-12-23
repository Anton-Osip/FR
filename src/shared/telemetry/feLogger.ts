import { getCookie } from '@/shared/api/http';
import { BFF, CLIENT_VERSION } from '@/shared/config/constants';
import type { Ctx, Entry, Level } from '@/shared/schemas';

const ENDPOINT = `${BFF}/ops/fe-log`;
const DEFAULT_MAX_BATCH = 50;
const DEFAULT_FLUSH_MS = 250;
const MAX_BATCH = Number(import.meta.env.VITE_FE_LOG_MAX_BATCH ?? DEFAULT_MAX_BATCH);
const FLUSH_MS = Number(import.meta.env.VITE_FE_LOG_FLUSH_MS ?? DEFAULT_FLUSH_MS);

const SID_KEY = 'skylon_sid';

function sid(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let v = localStorage.getItem(SID_KEY);

    if (!v) {
      v = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
      localStorage.setItem(SID_KEY, v);
    }

    return v;
  } catch {
    return 'anon';
  }
}

const queue: Entry[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

let csrfWarm = false;

async function ensureCsrfCookie(): Promise<void> {
  if (csrfWarm) return;
  if (!BFF) return;
  if (getCookie('csrf')) {
    csrfWarm = true;

    return;
  }
  try {
    await fetch(`${BFF}/ops/healthz`, { method: 'GET', credentials: 'include' });
  } catch {
    /* noop */
  } finally {
    csrfWarm = true;
  }
}

function flush(): void {
  if (typeof window === 'undefined') return;
  if (!queue.length || !ENDPOINT) return;
  const batch = queue.splice(0, MAX_BATCH);

  void (async () => {
    await ensureCsrfCookie();
    const body = JSON.stringify({
      sid: sid(),
      page: location.pathname,
      platform: 'web',
      v: CLIENT_VERSION,
      csrf: getCookie('csrf') || '',
      batch,
    });
    const sameOrigin = (() => {
      try {
        return new URL(ENDPOINT).origin === location.origin;
      } catch {
        return false;
      }
    })();

    if (sameOrigin && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
        credentials: 'include',
      }).catch(() => {
        /* noop */
      });
    }
  })();
}

function push(level: Level, msg: string, ctx?: Ctx): void {
  if (typeof msg === 'string' && /bearer\s+[a-z0-9._-]+/i.test(msg)) return;
  const reqId = (() => {
    if (!ctx || typeof ctx !== 'object') return undefined;
    const v = (ctx as Record<string, unknown>).reqId;

    return typeof v === 'string' ? v : undefined;
  })();

  queue.push({ level, msg, ts: new Date().toISOString(), reqId, ctx });
  if (queue.length >= MAX_BATCH) flush();
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, FLUSH_MS);
}

/**
 * Клиентский логгер с батчингом и best-effort доставкой.
 * - Автоматически отбрасывает сообщения с очевидным `bearer <token>` в тексте.
 * - Отправляет батчи в BFF (`/ops/fe-log`) через `sendBeacon`/`fetch`.
 */
export const feLog = {
  info: (msg: string, ctx?: Ctx) => push('info', msg, ctx),
  warn: (msg: string, ctx?: Ctx) => push('warn', msg, ctx),
  error: (msg: string, ctx?: Ctx) => push('error', msg, ctx),
  debug: (msg: string, ctx?: Ctx) => push('debug', msg, ctx),
  flush,
};
