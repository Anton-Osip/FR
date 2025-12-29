import { FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { BettingTableBetItem } from '@shared/schemas';
import { Table } from '@shared/ui';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { formatAmount } from '@shared/utils/formatAmount.ts';
import { formatBalance } from '@shared/utils/formatBalance.ts';
import { formatMultiplier } from '@shared/utils/formatMultiplier.ts';

import styles from './BettingTable.module.scss';

interface BettingTableProps {
  items?: BettingTableBetItem[];
  isLoading?: boolean;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const BettingTable: FC<BettingTableProps> = ({ items, isLoading }) => {
  const { t } = useTranslation('home');

  const headerData = useMemo(
    () => [
      { id: 'user', label: t('betsSection.table.user') },
      { id: 'game', label: t('betsSection.table.game') },
      { id: 'amount', label: t('betsSection.table.amount') },
      { id: 'multiplier', label: t('betsSection.table.multiplier') },
      { id: 'payout', label: t('betsSection.table.payout') },
    ],
    [t],
  );

  const itemsWithId = useMemo(
    () =>
      (items || []).map(item => {
        const uuid = item.uuid;

        return {
          ...item,
          id: uuid || generateId(),
        };
      }),
    [items],
  );

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
        {isLoading && (!items || items.length === 0) ? (
          Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className={`${styles.userHead} ${styles.td}`}>
                <div className={styles.userCell}>
                  <div className={`${styles.userAvatar} ${styles.skeleton}`} />
                  <span className={`${styles.userName} ${styles.skeletonText}`} />
                </div>
              </TableCell>
              <TableCell className={`${styles.gameCellBody} ${styles.td}`}>
                <div className={styles.gameCell}>
                  <div className={`${styles.gameIcon} ${styles.skeleton}`} />
                  <span className={`${styles.gameName} ${styles.skeletonText}`} />
                </div>
              </TableCell>
              <TableCell className={`${styles.amountCell} ${styles.td}`}>
                <span className={styles.skeletonText} />
              </TableCell>
              <TableCell className={`${styles.multiplierCell} ${styles.td}`}>
                <span className={styles.skeletonText} />
              </TableCell>
              <TableCell className={`${styles.payoutCell} ${styles.td}`}>
                <span className={styles.skeletonText} />
              </TableCell>
            </TableRow>
          ))
        ) : !isLoading && (!items || items.length === 0) ? (
          <TableRow className={styles.emptyRow}>
            <td className={`${styles.emptyCell} ${styles.td}`} colSpan={headerData.length}>
              <div className={styles.emptyMessage}>{t('betsSection.table.nothingFound')}</div>
            </td>
          </TableRow>
        ) : (
          itemsWithId.map(item => {
            const payoutClassName =
              item.payout > 0 ? `${styles.payoutCell} ${styles['payoutCell--win']}` : styles.payoutCell;

            return (
              <TableRow key={item.id}>
                <TableCell className={`${styles.userHead} ${styles.td}`}>
                  <div className={styles.userCell}>
                    <img src={item.avatar_url} alt={item.user_name} className={styles.userAvatar} />
                    <span className={styles.userName}>{item.user_name}</span>
                  </div>
                </TableCell>
                <TableCell className={`${styles.gameCellBody} ${styles.td}`}>
                  <div className={styles.gameCell}>
                    <img src={item.game_image_url} alt={item.game_title} className={styles.gameIcon} />
                    <span className={styles.gameName}>{item.game_title}</span>
                  </div>
                </TableCell>
                <TableCell className={`${styles.amountCell} ${styles.td}`}>{formatAmount(item.stake)} ₽</TableCell>
                <TableCell className={`${styles.multiplierCell} ${styles.td}`}>
                  {formatMultiplier(item.multiplier)}×
                </TableCell>
                <TableCell className={`${payoutClassName} ${styles.td}`}>{formatBalance(item.payout)} ₽</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
