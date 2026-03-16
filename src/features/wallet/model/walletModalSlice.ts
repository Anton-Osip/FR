import { createSlice } from '@reduxjs/toolkit';

import type {
  CryptoWithdrawMethod,
  FiatWithdrawMethod,
  TelegramWithdrawAsset,
  WalletDepositActiveResponse,
  WalletDepositResponse,
} from './apiTypes';
import { DEFAULT_ACTIVE_TAB } from './constants';
import { type ActiveTab, type ShowWalletModal, WALLET_MODAL } from './types';

export type WithdrawMethod = FiatWithdrawMethod | CryptoWithdrawMethod | TelegramWithdrawAsset;
type MethodsPollingMap = Record<string, MethodPolling>;
type MethodPolling = {
  isPollingActive: boolean;
  pollingByMethod: string;
  timer: number;
  paymentDetailsError: boolean;
};
export const walletModalSlice = createSlice({
  initialState: {
    showModal: WALLET_MODAL.WALLET as ShowWalletModal,
    contentKey: 0 as number,
    selectedWithdrawMethod: null as WithdrawMethod | null,
    activeTab: DEFAULT_ACTIVE_TAB as ActiveTab,
    depositData: null as WalletDepositResponse | null,
    depositActiveData: null as WalletDepositActiveResponse | null,
    methodsPollingMap: null as MethodsPollingMap | null,
    modalWalletIsOpen: false as boolean,
  },
  name: 'walletModal',
  reducers: create => ({
    setModalWalletIsOpen: create.reducer<{ value?: boolean }>((state, action) => {
      const { value } = action.payload;

      if (typeof value === 'boolean') state.modalWalletIsOpen = value;
      if (typeof value !== 'boolean') state.modalWalletIsOpen = !state.modalWalletIsOpen;
    }),
    createMethodsPolling: create.reducer<{ method: string }>((state, action) => {
      const { method } = action.payload;

      if (!state.methodsPollingMap) {
        state.methodsPollingMap = {};
      }

      state.methodsPollingMap[method] = {
        isPollingActive: true,
        pollingByMethod: method,
        timer: 90,
        paymentDetailsError: false,
      };
    }),

    setTimerValue: create.reducer<{ method: string; value: number }>((state, action) => {
      const { value, method } = action.payload;

      if (!state.methodsPollingMap) return;
      state.methodsPollingMap[method].timer = value;
    }),
    setPaymentDetailsError: create.reducer<{ method: string; value: boolean }>((state, action) => {
      const { value, method } = action.payload;

      if (!state.methodsPollingMap) return;

      if (!state.methodsPollingMap[method]) {
        return;
      }

      state.methodsPollingMap[method].paymentDetailsError = value;
    }),

    removeMethodsPolling: create.reducer<{ method: string }>((state, action) => {
      const { method } = action.payload;

      if (!state.methodsPollingMap) return;

      delete state.methodsPollingMap[method];

      if (Object.keys(state.methodsPollingMap).length === 0) {
        state.methodsPollingMap = null;
      }
    }),

    setMethodPollingActive: create.reducer<{ method: string; value: boolean }>((state, action) => {
      const { method, value } = action.payload;

      if (!state.methodsPollingMap) return;
      state.methodsPollingMap[method].isPollingActive = value;
    }),

    setShowModal: create.reducer<{ showModal: ShowWalletModal }>((state, action) => {
      state.showModal = action.payload.showModal;
    }),
    setSelectedWithdrawMethod: create.reducer<{ method: WithdrawMethod }>((state, action) => {
      state.selectedWithdrawMethod = action.payload.method;
    }),
    setDepositData: create.reducer<{ data: WalletDepositResponse | null }>((state, action) => {
      state.depositData = action.payload.data;
    }),
    setDepositActiveData: create.reducer<{ data: WalletDepositActiveResponse | null }>((state, action) => {
      state.depositActiveData = action.payload.data;
    }),
    setActiveTab: create.reducer<{ activeTab: ActiveTab }>((state, action) => {
      state.activeTab = action.payload.activeTab;
    }),
    resetModal: create.reducer(state => {
      state.showModal = WALLET_MODAL.WALLET;
      state.contentKey += 1;
      state.selectedWithdrawMethod = null;
      state.activeTab = DEFAULT_ACTIVE_TAB;
      state.depositData = null;
      state.depositActiveData = null;
    }),
    incrementContentKey: create.reducer(state => {
      state.contentKey += 1;
    }),
  }),
  selectors: {
    selectShowModal: state => state.showModal,
    selectContentKey: state => state.contentKey,
    selectSelectedWithdrawMethod: state => state.selectedWithdrawMethod,
    selectActiveTab: state => state.activeTab,
    selectDepositData: state => state.depositData,
    selectDepositActiveData: state => state.depositActiveData,
    selectMethodPollingMap: state => state.methodsPollingMap,
    selectModalWalletIsOpen: state => state.modalWalletIsOpen,
    selectMethodPollingActiveMap: state => {
      const methodsPollingMap = state.methodsPollingMap;

      if (!methodsPollingMap) return null;

      const result: Record<string, boolean> = {};

      Object.entries(methodsPollingMap).forEach(([method, value]) => {
        result[method] = value.isPollingActive;
      });

      return result;
    },
  },
});

export const {
  setShowModal,
  setSelectedWithdrawMethod,
  setDepositData,
  setDepositActiveData,
  setActiveTab,
  resetModal,
  incrementContentKey,
  createMethodsPolling,
  setMethodPollingActive,
  setTimerValue,
  setPaymentDetailsError,
  setModalWalletIsOpen,
} = walletModalSlice.actions;
export const {
  selectShowModal,
  selectContentKey,
  selectSelectedWithdrawMethod,
  selectActiveTab,
  selectDepositData,
  selectDepositActiveData,
  selectMethodPollingMap,
  selectMethodPollingActiveMap,
  selectModalWalletIsOpen,
} = walletModalSlice.selectors;
export const walletModalReducer = walletModalSlice.reducer;
