/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL?: string;
  readonly VITE_WEBAPP_VERSION?: string;
  readonly VITE_TELEGRAM_BOT_NAME?: string;
  readonly VITE_LOGIN_ORIGIN?: string;
  readonly VITE_LOGIN_RETURN_TO_HOSTS?: string;
  readonly VITE_FE_LOG_MAX_BATCH?: string;
  readonly VITE_FE_LOG_FLUSH_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

