import type { ReactNode } from 'react';

/**
 * Тип активной вкладки в модальном окне кошелька
 */
export type ActiveTab = 'deposit' | 'withdraw';

export interface TabConfigBase {
  id: string;
  value: ActiveTab;
  labelKey: string;
}

export interface TabConfig extends TabConfigBase {
  icon: ReactNode;
}

export interface WalletModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const WALLET_MODAL = {
  WALLET: 'wallet',
  BANK_PAYMENT: 'bankPayment',
  WITHDRAWAL_BY_CARD: 'withdrawalByCard',
  CONCLUSION: 'conclusion',
  SBP_PAYMENT_DETAIL_CONTENT: 'sbpPaymentDetailContent',
  SBP_PAYMENT_FORM_CONTENT: 'SbpPaymentFormContent',
  WITHDRAWAL_BY_CRYPTOCURRENCY: 'withdrawalByCryptocurrency',
  CRYPTOCURRENCY_PAYMENT_CONTENT: 'cryptocurrencyPaymentContent',
  TELEGRAMCURRENCY_PAYMENT_CONTENT: 'telegramcurrencyPaymentContent',
  WITHDRAWAL_BY_TELEGRAM_CURRENCY: 'withdrawalByTelegramcurrency',
} as const;

/**
 * Тип отображаемого содержимого в модальном окне кошелька
 */
export type ShowWalletModal = (typeof WALLET_MODAL)[keyof typeof WALLET_MODAL];
