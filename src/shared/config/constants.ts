export const BFF = (import.meta.env.VITE_BFF_URL || '').replace(/\/+$/, '');
export const CLIENT_VERSION = import.meta.env.VITE_WEBAPP_VERSION || 'webapp/1';
export const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'skylon';
export const LOGIN_ORIGIN = (import.meta.env.VITE_LOGIN_ORIGIN || 'https://login.fr0.me').replace(/\/+$/, '');
export const LOGIN_HOSTNAME = (() => {
  try {
    return new URL(LOGIN_ORIGIN).hostname;
  } catch {
    return '';
  }
})();
export const LOGIN_RETURN_TO_HOSTS = (import.meta.env.VITE_LOGIN_RETURN_TO_HOSTS || '').trim()
  ? (import.meta.env.VITE_LOGIN_RETURN_TO_HOSTS || '')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
  : ['fr0.me', '.fr0.me', 'localhost', '127.0.0.1'];
