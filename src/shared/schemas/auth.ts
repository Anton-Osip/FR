export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface TelegramLoginWidgetData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated' | 'error';
export type AppMode = 'unknown' | 'webapp' | 'site';
