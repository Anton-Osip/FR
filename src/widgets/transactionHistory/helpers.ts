import { formatDate, formatTime } from '@shared/lib';

import { mapTransactionStatus, type TransactionGroup, type TransactionItemData } from '@entities/transaction';
import { type WalletTransaction } from '@features/wallet';

/**
 * Трансформирует массив транзакций из API в сгруппированные по датам данные
 * @param transactions - Массив транзакций из API
 * @returns Массив транзакций, сгруппированных по датам
 */
export const transformTransactions = (transactions: WalletTransaction[]): TransactionGroup[] => {
  const grouped = new Map<string, TransactionItemData[]>();

  transactions.forEach(transaction => {
    const dateKey = formatDate(transaction.created_at);
    const item: TransactionItemData = {
      id: transaction.uuid,
      type: transaction.kind === 'deposit' ? 'in' : 'out',
      time: formatTime(transaction.created_at),
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: mapTransactionStatus(transaction.status),
    };

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    const items = grouped.get(dateKey);

    if (items) {
      items.push(item);
    }
  });

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    items,
  }));
};
