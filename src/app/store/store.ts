import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { baseApi } from '@shared/api/baseApi.ts';
import { appReducer } from '@shared/store/slices/appSlice.ts';

import '@/features/auth/api.ts';
import '@/features/invite/inviteApi.ts';
import '@/features/showcase/showcaseApi.ts';
import '@/features/user/userApi.ts';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    app: appReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
});

// Включаем поведение refetchOnFocus и refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
