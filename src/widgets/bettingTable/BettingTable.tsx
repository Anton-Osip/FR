import type { FC } from 'react';

import { Table } from '@shared/ui';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';

import styles from './BettingTable.module.scss';
import type { BettingTableItem } from './mockTable';

interface BettingTableProps {
  items: BettingTableItem[];
}

const headerData = [
  { id: 'user', label: 'Пользователь' },
  { id: 'game', label: 'Игра' },
  { id: 'amount', label: 'Сумма ставки' },
  { id: 'multiplier', label: 'Множитель' },
  { id: 'payout', label: 'Выплата' },
];

export const BettingTable: FC<BettingTableProps> = ({ items }) => {
  return (
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
        {items.map(item => {
          const payoutClassName = item.isWin ? `${styles.payoutCell} ${styles['payoutCell--win']}` : styles.payoutCell;

          return (
            <TableRow key={item.id}>
              <TableCell className={`${styles.userHead} ${styles.td}`}>
                <div className={styles.userCell}>
                  <span className={styles.userAvatar} />
                  <span className={styles.userName}>{item.user}</span>
                </div>
              </TableCell>
              <TableCell className={`${styles.gameCellBody} ${styles.td}`}>
                <div className={styles.gameCell}>
                  <span className={styles.gameIcon} />
                  <span className={styles.gameName}>{item.game}</span>
                </div>
              </TableCell>
              <TableCell className={`${styles.amountCell} ${styles.td}`}>{item.betAmount}</TableCell>
              <TableCell className={`${styles.multiplierCell} ${styles.td}`}>{item.multiplier}</TableCell>
              <TableCell className={`${payoutClassName} ${styles.td}`}>{item.payout}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
