import { create } from 'zustand';

import type { AppMode, AuthStatus, UserMe } from '@/shared/schemas';

export type AuthStoreState = {
  authStatus: AuthStatus;
  errorMessage: string;
  me: UserMe | null;
  mode: AppMode;
  setAuthStatus: (status: AuthStatus) => void;
  setErrorMessage: (msg: string) => void;
  setMe: (me: UserMe | null | ((prev: UserMe | null) => UserMe | null)) => void;
  setMode: (mode: AppMode) => void;
  showSiteLogin: () => void;
  resetError: () => void;
};

export const useAuthStore = create<AuthStoreState>(set => ({
  authStatus: 'idle',
  errorMessage: '',
  me: null,
  mode: 'unknown',

  setAuthStatus: (status: AuthStatus) => set({ authStatus: status }),
  setErrorMessage: (msg: string) => set({ errorMessage: msg }),
  setMe: (me: UserMe | null | ((prev: UserMe | null) => UserMe | null)) =>
    set(state => ({
      me: typeof me === 'function' ? (me as (prev: UserMe | null) => UserMe | null)(state.me) : me,
    })),
  setMode: (mode: AppMode) => set({ mode }),
  showSiteLogin: () =>
    set(state =>
      state.authStatus === 'checking' || state.authStatus === 'authenticated'
        ? { mode: 'site' }
        : { mode: 'site', authStatus: 'unauthenticated' },
    ),
  resetError: () => set({ errorMessage: '' }),
}));
