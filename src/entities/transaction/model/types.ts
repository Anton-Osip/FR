import type { Currency } from '@/shared/model/types/currency';

export type TransactionType = 'in' | 'out';
export type TransactionStatus = 'rejected' | 'pending' | 'resolved';

export interface TransactionItemData {
  id: string | number;
  type: TransactionType;
  time: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  onClick?: () => void;
}

export interface TransactionGroup {
  date: string;
  items: TransactionItemData[];
}

/**
 * Маппинг статусов из API в UI
 *
 * Примечание: API возвращает статусы в формате WalletTransactionStatus ('success' | 'pending' | 'rejected'),
 * но UI использует TransactionStatus ('resolved' | 'pending' | 'rejected').
 * 'success' маппится в 'resolved' для единообразия с UI терминологией.
 */
export const TRANSACTION_STATUS_MAP: Record<string, TransactionStatus> = {
  success: 'resolved',
  pending: 'pending',
  rejected: 'rejected',
  failed: 'rejected',
};

/**
 * Маппит статус транзакции из API формата в UI формат
 */
export const mapTransactionStatus = (status: string): TransactionStatus => {
  return TRANSACTION_STATUS_MAP[status] ?? 'pending';
};
