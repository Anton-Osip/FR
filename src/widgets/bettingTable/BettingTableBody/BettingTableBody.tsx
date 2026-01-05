import { memo } from 'react';

import clsx from 'clsx';

import { formatAmount, formatBalance, formatMultiplier } from '@shared/lib/';
import { BettingTableBetItem } from '@shared/model';
import { TableCell, TableRow } from '@shared/ui';

import styles from './BettingTableBody.module.scss';

export interface BettingTableBodyProps {
  itemsWithId: Array<BettingTableBetItem & { id: string }>;
  isLoading: boolean;
  items?: BettingTableBetItem[];
  headerCount: number;
  emptyMessage: string;
}

export const BettingTableBody = memo<BettingTableBodyProps>(
  ({ itemsWithId, isLoading, items, headerCount, emptyMessage }) => {
    if (isLoading && (!items || items.length === 0)) {
      return (
        <>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className={clsx(styles.userHead, styles.td)}>
                <div className={styles.userCell}>
                  <div className={clsx(styles.userAvatar, styles.skeleton)} />
                  <span className={clsx(styles.userName, styles.skeletonText)} />
                </div>
              </TableCell>
              <TableCell className={clsx(styles.gameCellBody, styles.td)}>
                <div className={styles.gameCell}>
                  <div className={clsx(styles.gameIcon, styles.skeleton)} />
                  <span className={clsx(styles.gameName, styles.skeletonText)} />
                </div>
              </TableCell>
              <TableCell className={clsx(styles.amountCell, styles.td)}>
                <span className={styles.skeletonText} />
              </TableCell>
              <TableCell className={clsx(styles.multiplierCell, styles.td)}>
                <span className={styles.skeletonText} />
              </TableCell>
              <TableCell className={clsx(styles.payoutCell, styles.td)}>
                <span className={styles.skeletonText} />
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    }

    if (!isLoading && (!items || items.length === 0)) {
      return (
        <TableRow className={styles.emptyRow}>
          <td className={clsx(styles.emptyCell, styles.td)} colSpan={headerCount}>
            <div className={styles.emptyMessage}>{emptyMessage}</div>
          </td>
        </TableRow>
      );
    }

    return (
      <>
        {itemsWithId.map(item => {
          const payoutClassName = clsx(styles.payoutCell, item.payout > 0 && styles['payoutCell--win']);

          return (
            <TableRow key={item.id}>
              <TableCell className={clsx(styles.userHead, styles.td)}>
                <div className={styles.userCell}>
                  <img src={item.avatar_url} alt={item.user_name} className={styles.userAvatar} />
                  <span className={styles.userName}>{item.user_name}</span>
                </div>
              </TableCell>
              <TableCell className={clsx(styles.gameCellBody, styles.td)}>
                <div className={styles.gameCell}>
                  <img src={item.game_image_url} alt={item.game_title} className={styles.gameIcon} />
                  <span className={styles.gameName}>{item.game_title}</span>
                </div>
              </TableCell>
              <TableCell className={clsx(styles.amountCell, styles.td)}>{formatAmount(item.stake)} ₽</TableCell>
              <TableCell className={clsx(styles.multiplierCell, styles.td)}>
                {formatMultiplier(item.multiplier)}×
              </TableCell>
              <TableCell className={clsx(payoutClassName, styles.td)}>{formatBalance(item.payout)} ₽</TableCell>
            </TableRow>
          );
        })}
      </>
    );
  },
);

BettingTableBody.displayName = 'BettingTableBody';
