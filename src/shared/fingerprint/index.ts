import type {
  ClientProfileBase,
  ClientProfilePayload,
  GL,
  NavigatorUserAgentDataBrand,
  NavigatorWithUserAgentData,
  UaBrand,
  WebGLDebugRendererInfoExt,
} from '@/shared/schemas';

export type { ClientProfileBase, ClientProfilePayload, UaBrand } from '@/shared/schemas';

function b64url(buf: ArrayBuffer): string {
  const s = String.fromCharCode(...new Uint8Array(buf));

  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randId(n = 16): string {
  const a = new Uint8Array(n);

  crypto.getRandomValues(a);

  return b64url(a.buffer);
}

async function sha256(s: string): Promise<string> {
  const enc = new TextEncoder();
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));

  return b64url(d);
}

async function canvasFingerprint(): Promise<string> {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');

  if (!ctx) return '';
  c.width = 280;
  c.height = 60;
  ctx.textBaseline = 'alphabetic';
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('skylon_fp', 2, 40);
  ctx.strokeStyle = '#ff0';
  ctx.arc(50, 50, 20, 0, Math.PI * 2);
  ctx.stroke();
  const data = c.toDataURL();

  return sha256(data);
}

let cachedWebglInfo: { vendor: string; renderer: string } | null = null;
let cachedCanvasHashPromise: Promise<string> | null = null;

function getGL(): GL | null {
  const c = document.createElement('canvas');

  return (
    (c.getContext('webgl2') as GL) ||
    (c.getContext('webgl') as GL) ||
    (c.getContext('experimental-webgl') as GL) ||
    null
  );
}

function webglInfo(): { vendor: string; renderer: string } {
  const gl = getGL();

  if (!gl) return { vendor: '', renderer: '' };
  const ext = gl.getExtension('WEBGL_debug_renderer_info') as unknown as WebGLDebugRendererInfoExt | null;

  if (ext && ext.UNMASKED_VENDOR_WEBGL && ext.UNMASKED_RENDERER_WEBGL) {
    const vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '');
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');

    return { vendor, renderer };
  }
  const VENDOR = 0x1f00;
  const RENDERER = 0x1f01;
  const vendor = String(gl.getParameter(VENDOR) || '');
  const renderer = String(gl.getParameter(RENDERER) || '');

  return { vendor, renderer };
}

function getWebglInfoCached(): { vendor: string; renderer: string } {
  if (cachedWebglInfo) return cachedWebglInfo;
  cachedWebglInfo = webglInfo();

  return cachedWebglInfo;
}

function getCanvasHashCached(): Promise<string> {
  if (cachedCanvasHashPromise) return cachedCanvasHashPromise;
  cachedCanvasHashPromise = canvasFingerprint().catch(() => '');

  return cachedCanvasHashPromise;
}

function getBrowserId(): string {
  try {
    const k = 'skylon_bid';
    let v = localStorage.getItem(k);

    if (!v) {
      v = randId(24);
      localStorage.setItem(k, v);
    }

    return v;
  } catch {
    return randId(24);
  }
}

export async function collectClientProfile(): Promise<ClientProfileBase> {
  const nav = navigator as NavigatorWithUserAgentData;
  const language = navigator.language || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const screenRes =
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}@${window.devicePixelRatio || 1}` : '';
  const userAgent = navigator.userAgent || '';
  const uaData = nav.userAgentData || null;
  const uaBrands: UaBrand[] = (() => {
    const brands = uaData?.brands;

    if (!Array.isArray(brands)) return [];

    return brands
      .map((b: unknown) => {
        const rec = (b && typeof b === 'object' ? b : {}) as NavigatorUserAgentDataBrand;
        const brand = typeof rec.brand === 'string' ? rec.brand : '';
        const version = typeof rec.version === 'string' ? rec.version : '';

        return { brand, version };
      })
      .filter((b: UaBrand) => b.brand && b.version);
  })();
  const uaMobile = !!uaData && uaData.mobile === true;
  const platform = String(
    (uaData && typeof uaData.platform === 'string' ? uaData.platform : '') || navigator.platform || '',
  );
  const hardwareConcurrency = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : undefined;
  const deviceMemory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined;
  const maxTouchPoints = typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : undefined;
  const { vendor: webglVendor, renderer: webglRenderer } = getWebglInfoCached();
  const canvasHash = await getCanvasHashCached();
  const browserId = getBrowserId();
  const deviceType: 'mobile' | 'desktop' =
    /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent) || uaMobile ? 'mobile' : 'desktop';

  return {
    language,
    timezone,
    screenRes,
    userAgent,
    uaBrands,
    uaMobile,
    platform,
    hardwareConcurrency,
    deviceMemory,
    maxTouchPoints,
    webglVendor,
    webglRenderer,
    canvasHash,
    browserId,
    deviceType,
  };
}

/**
 * Собирает client-profile и добавляет версию приложения для передачи в API (BFF).
 */
export async function collectClientProfilePayload(clientVersion: string): Promise<ClientProfilePayload> {
  const fp = await collectClientProfile();

  return {
    ...fp,
    clientVersion,
  };
}
