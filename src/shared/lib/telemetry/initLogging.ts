import { type CLSMetric, type INPMetric, type LCPMetric, onCLS, onINP, onLCP } from 'web-vitals';

import { feLog } from '@shared/lib/telemetry/feLogger.ts';

declare global {
  interface Window {
    __skylon_logging_inited?: boolean;
  }
}

function toErrorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string') return reason;
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

/**
 * Инициализирует клиентскую телеметрию: window errors, unhandled rejections и web-vitals.
 * Повторный вызов безопасен (однократная инициализация).
 */
export const initLogging = (): void => {
  if (typeof window === 'undefined') return;
  if (window.__skylon_logging_inited) return;
  window.__skylon_logging_inited = true;

  window.addEventListener('error', e => {
    feLog.error('window.error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    feLog.error('unhandledrejection', { message: toErrorMessage(e.reason) });
  });

  onLCP((m: LCPMetric) => feLog.info('webvitals', { metric: 'LCP', value: m.value, id: m.id }));
  onCLS((m: CLSMetric) => feLog.info('webvitals', { metric: 'CLS', value: m.value, id: m.id }));
  onINP((m: INPMetric) => feLog.info('webvitals', { metric: 'INP', value: m.value, id: m.id }));

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') feLog.flush();
  });
  window.addEventListener('beforeunload', () => feLog.flush());
};
