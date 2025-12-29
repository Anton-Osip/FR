export type StatusBadgeStatus = 'idle' | 'auth_ok' | 'auth_fail' | 'checking' | 'me_ok' | 'me_fail';

export type StatusBadgeProps = {
  status: StatusBadgeStatus;
  message: string;
};

export type TelegramLoginWidgetProps = {
  botName: string;
  autoClick?: boolean;
};
