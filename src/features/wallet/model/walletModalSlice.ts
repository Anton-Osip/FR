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

export const walletModalSlice = createSlice({
  initialState: {
    showModal: WALLET_MODAL.WALLET as ShowWalletModal,
    contentKey: 0 as number,
    selectedWithdrawMethod: null as WithdrawMethod | null,
    activeTab: DEFAULT_ACTIVE_TAB as ActiveTab,
    depositData: null as WalletDepositResponse | null,
    depositActiveData: null as WalletDepositActiveResponse | null,
  },
  name: 'walletModal',
  reducers: create => ({
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
} = walletModalSlice.actions;
export const {
  selectShowModal,
  selectContentKey,
  selectSelectedWithdrawMethod,
  selectActiveTab,
  selectDepositData,
  selectDepositActiveData,
} = walletModalSlice.selectors;
export const walletModalReducer = walletModalSlice.reducer;
