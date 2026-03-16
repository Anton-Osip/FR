import { memo } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import anonAvatar from '@shared/assets/images/anon_avatar.webp';
import { APP_PATH } from '@shared/config';
import { formatAmount, formatBalance, getCurrencySymbol, handleImageError } from '@shared/lib/';
import { BettingTableBetItem } from '@shared/model';
import { EmptyState, Spinner, TableCell, TableRow } from '@shared/ui';

import styles from './BettingTableBody.module.scss';

export interface BettingTableBodyProps {
  itemsWithId: Array<BettingTableBetItem & { id: string }>;
  isLoading: boolean;
  items?: BettingTableBetItem[];
  headerCount: number;
  page?: 'home' | 'games' | 'game';
}

export const BettingTableBody = memo<BettingTableBodyProps>(
  ({ itemsWithId, isLoading, items, headerCount, page = 'home' }) => {
    const navigate = useNavigate();

    const handleRowClick = (gameUuid: string): void => {
      const gamePath = APP_PATH.slot.replace(':id', gameUuid);

      navigate(gamePath);
    };

    if (isLoading && (!items || items.length === 0)) {
      return (
        <TableRow className={styles.loadingRow}>
          <td className={clsx(styles.loadingCell, styles.td)} colSpan={headerCount}>
            <div className={styles.loadingContainer}>
              <Spinner />
            </div>
          </td>
        </TableRow>
      );
    }

    if (!isLoading && (!items || items.length === 0)) {
      return (
        <TableRow className={styles.emptyRow}>
          <td className={clsx(styles.emptyCell, styles.td)} colSpan={headerCount}>
            <EmptyState />
          </td>
        </TableRow>
      );
    }

    return (
      <>
        {itemsWithId.map(item => {
          const currencySymbol = getCurrencySymbol(item.currency);
          const payoutClassName = clsx(styles.payoutCell, item.payout > 0 && styles['payoutCell--win']);

          return (
            <TableRow
              className={clsx(page && styles[page])}
              key={item.id}
              onClick={() => item.game_uuid && handleRowClick(item.game_uuid)}
            >
              <TableCell className={clsx(styles.userHead, styles.td)}>
                <div className={styles.userCell}>
                  <img
                    src={item.avatar_url || anonAvatar}
                    alt={item.user_name}
                    className={styles.userAvatar}
                    onError={handleImageError}
                  />
                  <span className={styles.userName}>{item.user_name}</span>
                </div>
              </TableCell>
              <TableCell className={clsx(styles.gameCellBody, styles.td)}>
                <div className={styles.gameCell}>
                  <img
                    src={item.game_image_url || anonAvatar}
                    alt={item.game_title}
                    className={styles.gameIcon}
                    onError={handleImageError}
                  />
                  <span className={styles.gameName}>{item.game_title}</span>
                </div>
              </TableCell>
              <TableCell className={clsx(styles.amountCell, styles.td)}>
                {formatAmount(item.stake)} {currencySymbol}
              </TableCell>
              <TableCell className={clsx(styles.multiplierCell, styles.td)}>{item.multiplier}×</TableCell>
              <TableCell className={clsx(payoutClassName, styles.td)}>
                {formatBalance(item.payout)} {currencySymbol}
              </TableCell>
            </TableRow>
          );
        })}
        {isLoading && (
          <TableRow className={styles.loadingRow}>
            <td className={clsx(styles.loadingCell, styles.td)} colSpan={headerCount}>
              <div className={styles.loadingContainer}>
                <Spinner />
              </div>
            </td>
          </TableRow>
        )}
      </>
    );
  },
);

BettingTableBody.displayName = 'BettingTableBody';
