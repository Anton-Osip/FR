import { FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Table } from '@shared/ui';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table/Table';

import { getTableData } from './mockTable';
import styles from './TransactionHistory.module.scss';

export const TransactionHistory: FC = () => {
  const { t } = useTranslation('profile');

  const headerData = useMemo(
    () => [
      { id: 'transactionType', label: t('transactionHistory.headers.transactionType') },
      { id: 'amount', label: t('transactionHistory.headers.amount') },
      { id: 'date', label: t('transactionHistory.headers.date') },
      { id: 'status', label: t('transactionHistory.headers.status') },
    ],
    [t],
  );

  const tableData = useMemo(() => getTableData(t), [t]);

  return (
    <div className={styles.transactionHistory}>
      <h3 className={styles.title}>{t('transactionHistory.title')}</h3>

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
          {tableData.map(item => {
            const statusClassName =
              item.status === t('transactionHistory.statuses.success')
                ? `${styles.statusCell} ${styles.win}`
                : styles.statusCell;

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
