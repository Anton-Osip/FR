import type { FC } from 'react';

import { Table, Tabs } from '@shared/ui';
import { TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@shared/ui/table/Table';

import { TABLE_DATA } from '@widgets/ratingTable/mockTable';

import styles from './RatingTable.module.scss';

interface RatingTableProps {
  className?: string;
}

const items = [
  {
    id: '1',
    value: 'thisWeek',
    label: 'На этой неделе',
    active: true,
  },
  {
    id: '2',
    value: 'lastWeek',
    label: 'На прошлой неделе',
    active: false,
  },
];

const headerData = [
  { id: 'place', label: 'Место' },
  { id: 'user', label: 'Пользователь' },
  { id: 'amount', label: 'Сумма заработка' },
];

const USER_ID = 1323992;

export const RatingTable: FC<RatingTableProps> = ({ className }) => {
  const me = TABLE_DATA.find(item => item.id === USER_ID);

  return (
    <div className={`${styles.ratingTable} ${className ?? ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Таблица рейтинга</h2>
        <div className={styles.tabs}>
          <Tabs items={items} />
        </div>
      </header>

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
            return (
              <TableRow key={item.id} className={item.id === USER_ID ? styles.isMe : ''}>
                <TableCell className={`${styles.placeBody} ${styles.td}`}>{item.place}</TableCell>
                <TableCell className={`${styles.userBody} ${styles.td}`}>
                  <div className={styles.userCell}>
                    <span className={styles.userAvatar} />
                    <span className={styles.userName}>{item.id !== USER_ID ? item.user : 'Вы'}</span>
                  </div>
                </TableCell>
                <TableCell className={`${styles.amountBody} ${styles.td}`}>{item.amount} ₽</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className={styles.tFooter}>
          <TableRow>
            <TableHead className={`${styles.th} ${styles[styles.placeFooter]}`}>{me?.place}</TableHead>
            <TableCell className={`${styles.userBody} ${styles.td}`}>
              <div className={styles.userCell}>
                <span className={styles.userAvatar} />
                <span className={styles.userName}>Вы</span>
              </div>
            </TableCell>
            <TableHead className={`${styles.th} ${styles[styles.amountFooter]}`}>{me?.amount} ₽</TableHead>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
