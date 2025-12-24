export interface TransactionTableItem {
  id: number;
  transactionType: string;
  amount: string;
  date: string;
  status: string;
}

export const getTableData = (t: (key: string) => string): TransactionTableItem[] => [
  {
    id: 1323989,
    transactionType: t('transactionHistory.transactionTypes.deposit'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.success'),
  },
  {
    id: 1323990,
    transactionType: t('transactionHistory.transactionTypes.withdrawal'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.rejected'),
  },
  {
    id: 1323991,
    transactionType: t('transactionHistory.transactionTypes.deposit'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.success'),
  },
  {
    id: 1323992,
    transactionType: t('transactionHistory.transactionTypes.withdrawal'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.rejected'),
  },
  {
    id: 1323993,
    transactionType: t('transactionHistory.transactionTypes.deposit'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.success'),
  },
  {
    id: 1323994,
    transactionType: t('transactionHistory.transactionTypes.withdrawal'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.rejected'),
  },
  {
    id: 1323995,
    transactionType: t('transactionHistory.transactionTypes.deposit'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.success'),
  },
  {
    id: 1323996,
    transactionType: t('transactionHistory.transactionTypes.withdrawal'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.rejected'),
  },
  {
    id: 1323997,
    transactionType: t('transactionHistory.transactionTypes.deposit'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.success'),
  },
  {
    id: 1323998,
    transactionType: t('transactionHistory.transactionTypes.withdrawal'),
    amount: '10 000,05',
    date: '01.02.2025',
    status: t('transactionHistory.statuses.rejected'),
  },
];
