import { createSlice } from '@reduxjs/toolkit';

import { type AppMode, AuthStatus } from '@shared/model/types';

import type { UserMe } from '@/entities/user';

export type DeviceType = 'mobile' | 'desktop';

export const appSlice = createSlice({
  initialState: {
    isInitialized: false as boolean,
    isLoggedIn: false as boolean,
    status: 'idle' as AuthStatus,
    mode: 'unknown' as AppMode,
    userId: null as null | number,
    deviceType: 'desktop' as DeviceType,
    me: null as UserMe | null,
    errorMessage: '' as string,
    showSiteLogin: false as boolean,
  },
  name: 'app',
  reducers: create => ({
    setAppStatus: create.reducer<{ status: AuthStatus }>((state, action) => {
      state.status = action.payload.status;
    }),
    setIsInitialized: create.reducer<{ isInitialized: boolean }>((state, action) => {
      state.isInitialized = action.payload.isInitialized;
    }),
    setIsLoggedIn: create.reducer<{ isLoggedIn: boolean }>((state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    }),
    setUserId: create.reducer<{ userId: null | number }>((state, action) => {
      state.userId = action.payload.userId;
    }),
    setMode: create.reducer<{ mode: AppMode }>((state, action) => {
      state.mode = action.payload.mode;
    }),
    setDeviceType: create.reducer<{ type: DeviceType }>((state, action) => {
      state.deviceType = action.payload.type;
    }),
    setMe: create.reducer<{ me: UserMe | null }>((state, action) => {
      state.me = action.payload.me;
      state.userId = action.payload.me?.user_id ?? null;
      state.isLoggedIn = action.payload.me !== null;
    }),
    setErrorMessage: create.reducer<{ errorMessage: string }>((state, action) => {
      state.errorMessage = action.payload.errorMessage;
    }),
    resetError: create.reducer(state => {
      state.errorMessage = '';
    }),
    setShowSiteLogin: create.reducer<{ show: boolean }>((state, action) => {
      state.showSiteLogin = action.payload.show;
    }),
  }),
  selectors: {
    selectAppError: state => state.userId,
    selectAppStatus: state => state.status,
    selectAppSuccess: state => state.mode,
    selectIsInitialized: state => state.isInitialized,
    selectIsLoggedIn: state => state.isLoggedIn,
    selectDeviceType: state => state.deviceType,
    selectMe: state => state.me,
    selectErrorMessage: state => state.errorMessage,
    selectShowSiteLogin: state => state.showSiteLogin,
  },
});

export const {
  setAppStatus,
  setIsInitialized,
  setIsLoggedIn,
  setUserId,
  setMode,
  setDeviceType,
  setMe,
  setErrorMessage,
  resetError,
  setShowSiteLogin,
} = appSlice.actions;
export const {
  selectAppError,
  selectAppStatus,
  selectAppSuccess,
  selectIsInitialized,
  selectIsLoggedIn,
  selectDeviceType,
  selectMe,
  selectErrorMessage,
  selectShowSiteLogin,
} = appSlice.selectors;

export const appReducer = appSlice.reducer;
