import { readFileSync } from 'fs';
import { join } from 'path';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { randomBytes } from 'crypto';

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function parseSrcList(v: string | undefined): string[] {
  if (!v) return [];
  return String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function tryOrigin(v: string | undefined): string {
  try {
    if (!v) return '';
    if (!/^https?:\/\//i.test(v)) return '';
    return new URL(v).origin;
  } catch {
    return '';
  }
}

function buildCsp(nonce: string, env: Record<string, string> = process.env): string {
  const bff = (env.VITE_BFF_URL || '').replace(/\/+$/, '');
  const bffOrigin = tryOrigin(bff);
  const imgSrcExtra = parseSrcList(env.VITE_CSP_IMG_SRC);
  let connectSrcExtra = parseSrcList(env.VITE_CSP_CONNECT_SRC);

  // Всегда добавляем домены fr0.me для поддержки dev окружения
  // Это необходимо, так как в dev режиме могут использоваться разные поддомены
  const fr0Domains = ['https://dev-bff.fr0.me', 'https://bff.fr0.me', 'https://fr0.me'];

  // Добавляем домены fr0.me, если их еще нет в списке
  for (const domain of fr0Domains) {
    if (!connectSrcExtra.includes(domain)) {
      connectSrcExtra.push(domain);
    }
  }

  const scriptSrc = ["'self'", 'https://telegram.org', `'nonce-${nonce}'`];
  const styleSrc = ["'self'", "'unsafe-inline'"];
  const imgSrc = ["'self'", 'data:', 'https://telegram.org', 'https://oauth.telegram.org', ...imgSrcExtra];
  const fontSrc = ["'self'", 'data:'];
  const frameSrc = ['https://oauth.telegram.org', 'https://telegram.org'];

  const connectSrc = ["'self'", bffOrigin, ...connectSrcExtra].filter(Boolean);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `frame-src ${frameSrc.join(' ')}`,
    "form-action 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    'upgrade-insecure-requests',
  ].join('; ');
}

export function vitePluginCsp(): Plugin {
  const nonceMap = new WeakMap<object, string>();

  return {
    name: 'vite-plugin-csp',
    configResolved(config) {
      // Загружаем переменные окружения через Vite
      const env = loadEnv(config.mode, config.envDir || process.cwd(), '');
      // Сохраняем env для использования в buildCsp
      (this as any).env = env;
    },
    configureServer(server) {
      const env = (this as any).env || process.env;

      server.middlewares.use((req, res, next) => {
        const pathname = req.url || '/';
        const accept = req.headers.accept || '';
        const looksLikeAsset = /\.[a-z0-9]{2,5}$/i.test(pathname);

        const isHtml =
          req.method === 'GET' &&
          !pathname.startsWith('/@') &&
          !pathname.startsWith('/node_modules') &&
          !looksLikeAsset &&
          (accept.includes('text/html') || accept === '*/*' || accept === '');

        if (isHtml) {
          // Генерируем новый nonce для каждого запроса
          const requestNonce = b64url(randomBytes(16));
          const csp = buildCsp(requestNonce, env);

          // Сохраняем nonce в WeakMap, используя res как ключ
          nonceMap.set(res, requestNonce);
          res.setHeader('Content-Security-Policy', csp);

          // Отладочный вывод в dev режиме
          if (env.NODE_ENV !== 'production') {
            console.log('[CSP] Установлен CSP заголовок:');
            console.log('[CSP] connect-src:', csp.match(/connect-src\s+([^;]+)/)?.[1] || 'не найден');
          }
        }

        next();
      });
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, ctx) {
        // В dev режиме получаем nonce из WeakMap
        // В build режиме оставляем placeholder для замены на сервере
        if (ctx.server) {
          // Dev режим - получаем nonce из middleware
          let requestNonce: string;

          // Пытаемся получить nonce из res объекта
          const res = (ctx.server as any).res;
          if (res) {
            requestNonce = nonceMap.get(res) || b64url(randomBytes(16));
          } else {
            requestNonce = b64url(randomBytes(16));
          }

          // Заменяем placeholder на реальный nonce
          let transformedHtml = html.replace(/\{\{NONCE\}\}/g, requestNonce);

          // Добавляем nonce к script тегам, если его еще нет
          transformedHtml = transformedHtml.replace(/<script(?![^>]*nonce)/g, `<script nonce="${requestNonce}"`);

          return transformedHtml;
        } else {
          // Build режим - оставляем placeholder для замены на сервере
          // Просто убеждаемся, что placeholder присутствует
          return html;
        }
      },
    },
  };
}
