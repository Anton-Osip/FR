import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { baseApi } from '@shared/api';

import { appReducer } from './slices/appSlice';

import '@/features/auth/api/api';
import '@/features/invite/api/inviteApi';
import '@/features/showcase/api/showcaseApi';
import '@/entities/user/api/userApi';

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
