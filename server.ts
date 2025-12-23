import { randomBytes } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function b64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function parseSrcList(v: string | undefined): string[] {
  if (!v) return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
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

function buildCsp(nonce: string): string {
  const bff = (process.env.VITE_BFF_URL || '').replace(/\/+$/, '');
  const bffOrigin = tryOrigin(bff);
  const imgSrcExtra = parseSrcList(process.env.VITE_CSP_IMG_SRC);
  let connectSrcExtra = parseSrcList(process.env.VITE_CSP_CONNECT_SRC);
  
  // Всегда добавляем домены fr0.me для поддержки dev окружения
  // Это необходимо, так как в dev режиме могут использоваться разные поддомены
  const fr0Domains = [
    'https://dev-bff.fr0.me',
    'https://bff.fr0.me',
    'https://fr0.me',
  ];
  
  // Добавляем домены fr0.me, если их еще нет в списке
  for (const domain of fr0Domains) {
    if (!connectSrcExtra.includes(domain)) {
      connectSrcExtra.push(domain);
    }
  }

  const scriptSrc = ["'self'", 'https://telegram.org', `'nonce-${nonce}'`];
  const styleSrc = ["'self'", "'unsafe-inline'"];
  const imgSrc = [
    "'self'",
    'data:',
    'https://telegram.org',
    'https://oauth.telegram.org',
    ...imgSrcExtra,
  ];
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

async function serveStatic(
  res: ServerResponse,
  filePath: string,
  contentType: string,
): Promise<void> {
  try {
    const content = readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', content.length);
    res.end(content);
  } catch (error) {
    res.statusCode = 404;
    res.end('Not Found');
  }
}

async function serveIndex(res: ServerResponse, nonce: string, csp: string): Promise<void> {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    let html = readFileSync(indexPath, 'utf-8');

    // Заменяем nonce placeholder на реальный nonce
    html = html.replace(/\{\{NONCE\}\}/g, nonce);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', csp);
    res.end(html);
  } catch (error) {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}

const port = Number(process.env.PORT || process.env.APP_PORT || 7202);
const host = process.env.HOST || '0.0.0.0';

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const parsedUrl = parse(req.url || '/', true);
    const accept = String(req.headers.accept || '');
    const pathname = String(parsedUrl.pathname || '/');
    const looksLikeAsset = /\.[a-z0-9]{2,5}$/i.test(pathname);

    const isHtml =
      req.method === 'GET' &&
      !pathname.startsWith('/_next/') &&
      !looksLikeAsset &&
      (accept.includes('text/html') || accept === '*/*' || accept === '');

    if (isHtml) {
      const nonce = b64url(randomBytes(16));
      const csp = buildCsp(nonce);
      await serveIndex(res, nonce, csp);
    } else {
      // Статические файлы из dist
      const distPath = join(__dirname, 'dist');
      const filePath = join(distPath, pathname);

      // Проверяем существование файла
      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

      // Определяем content-type
      let contentType = 'application/octet-stream';
      if (pathname.endsWith('.js')) contentType = 'application/javascript';
      else if (pathname.endsWith('.css')) contentType = 'text/css';
      else if (pathname.endsWith('.html')) contentType = 'text/html';
      else if (pathname.endsWith('.json')) contentType = 'application/json';
      else if (pathname.endsWith('.png')) contentType = 'image/png';
      else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (pathname.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (pathname.endsWith('.woff') || pathname.endsWith('.woff2')) contentType = 'font/woff2';
      else if (pathname.endsWith('.otf')) contentType = 'font/otf';
      else if (pathname.endsWith('.ico')) contentType = 'image/x-icon';

      await serveStatic(res, filePath, contentType);
    }
  } catch (error) {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

