import { store } from '@app/store/store';

import type { AuthResult, ClientProfilePayload, TelegramLoginWidgetData } from '@shared/model';

import { authApi } from './api';

export async function authenticateTelegramWebApp(
  initData: string,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  const result = await store.dispatch(
    authApi.endpoints.authenticateTelegramWebApp.initiate({ initData, clientProfile }),
  );

  if ('error' in result && result.error) {
    const errorData =
      'data' in result.error && result.error.data ? (result.error.data as { error?: string }) : undefined;

    return { ok: false, error: errorData?.error || 'auth_failed' };
  }

  return { ok: true };
}

export async function authenticateTelegramLoginWidget(
  data: TelegramLoginWidgetData,
  clientProfile: ClientProfilePayload,
): Promise<AuthResult> {
  const result = await store.dispatch(
    authApi.endpoints.authenticateTelegramLoginWidget.initiate({ data, clientProfile }),
  );

  if ('error' in result && result.error) {
    const errorData =
      'data' in result.error && result.error.data ? (result.error.data as { error?: string }) : undefined;

    return { ok: false, error: errorData?.error || 'auth_failed' };
  }

  return { ok: true };
}

export async function logout(): Promise<boolean> {
  const result = await store.dispatch(authApi.endpoints.logout.initiate());

  if ('error' in result) {
    return false;
  }

  return true;
}
