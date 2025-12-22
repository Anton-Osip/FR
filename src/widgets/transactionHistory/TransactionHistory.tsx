import { FC } from 'react';

import { Table } from '@shared/ui';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table/Table';

import { TABLE_DATA } from './mockTable';
import styles from './TransactionHistory.module.scss';

const headerData = [
  { id: 'transactionType', label: 'Тип транзакции' },
  { id: 'amount', label: 'Сумма' },
  { id: 'date', label: 'Дата' },
  { id: 'status', label: 'Статус' },
];

export const TransactionHistory: FC = () => {
  return (
    <div className={styles.transactionHistory}>
      <h3 className={styles.title}>История транзакций</h3>

      <Table>
        <TableHeader>
          {headerData.map(item => {
            return (
              <TableHead key={item.id} className={`${styles.th} ${styles[item.id]}`}>
                {item.label}
              </TableHead>
            );
          })}
        </TableHeader>
        <TableBody>
          {TABLE_DATA.map(item => {
            const statusClassName =
              item.status === 'Успешно' ? `${styles.statusCell} ${styles.win}` : styles.statusCell;

            return (
              <TableRow key={item.id}>
                <TableCell className={`${styles.transactionTypeBody} ${styles.td}`}>
                  <span className={styles.transactionType}>{item.transactionType}</span>
                </TableCell>
                <TableCell className={`${styles.amountCellBody} ${styles.td}`}>
                  <span className={styles.amount}>{item.amount} ₽</span>
                </TableCell>
                <TableCell className={`${styles.dateCellBody} ${styles.td}`}>{item.date}</TableCell>
                <TableCell className={`${statusClassName} ${styles.td}`}>{item.status}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
