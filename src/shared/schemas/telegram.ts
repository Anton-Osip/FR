export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: unknown;
  ready?: () => void;
  expand?: () => void;
  version?: string;
  platform?: string;
};
