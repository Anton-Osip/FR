import { FC, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { selectMe } from '@app/store';

import { useAppSelector } from '@shared/api';
import anonAvatar from '@shared/assets/images/anon_avatar.webp';
import { formatBalance, getCurrencySymbol, handleImageError } from '@shared/lib';
import {
  EmptyState,
  Spinner,
  Table,
  Tabs,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';

import styles from './RatingTable.module.scss';

import { InviteWeek, useGetInviteLeaderboardQuery } from '@features/invite';

interface RatingTableProps {
  className?: string;
}

export const RatingTable: FC<RatingTableProps> = ({ className }) => {
  const { t } = useTranslation('invite');
  const [week, setWeek] = useState<InviteWeek>('this');

  const { data: leaderboardData, isFetching, isLoading } = useGetInviteLeaderboardQuery({ week });
  const me = useAppSelector(selectMe);
  const isSkeleton = isFetching || isLoading;
  const hasItems = (leaderboardData?.items?.length ?? 0) > 0;

  const items = useMemo(
    () => [
      {
        id: '1',
        value: 'this',
        label: t('ratingTable.tabs.thisWeek'),
        active: week === 'this',
      },
      {
        id: '2',
        value: 'prev',
        label: t('ratingTable.tabs.lastWeek'),
        active: week === 'prev',
      },
    ],
    [t, week],
  );

  const headerData = useMemo(
    () => [
      { id: 'place', label: t('ratingTable.headers.place') },
      { id: 'user', label: t('ratingTable.headers.user') },
      { id: 'amount', label: t('ratingTable.headers.amount') },
    ],
    [t],
  );

  return (
    <div className={clsx(styles.ratingTable, className)}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('ratingTable.title')}</h2>
        <div className={styles.tabs}>
          <Tabs items={items} onChange={value => setWeek(value as InviteWeek)} />
        </div>
      </header>

      <Table>
        <TableHeader>
          {headerData.map(item => {
            return (
              <TableHead key={item.id} className={clsx(styles.th, styles[item.id])}>
                {item.label}
              </TableHead>
            );
          })}
        </TableHeader>
        <TableBody>
          {isSkeleton ? (
            <TableRow className={styles.loadingRow}>
              <td className={clsx(styles.loadingCell, styles.td)} colSpan={headerData.length}>
                <div className={styles.loadingContainer}>
                  <Spinner />
                </div>
              </td>
            </TableRow>
          ) : !hasItems ? (
            <TableRow className={styles.emptyRow}>
              <td className={styles.emptyCell} colSpan={headerData.length}>
                <EmptyState title={t('ratingTable.emptyMessage')} />
              </td>
            </TableRow>
          ) : (
            leaderboardData?.items.map(item => {
              return (
                <TableRow key={item.place} className={clsx(item.is_me && styles.isMe)}>
                  <TableCell className={clsx(styles.placeBody, styles.td)}>{item.place}</TableCell>
                  <TableCell className={clsx(styles.userBody, styles.td)}>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        <img src={item.avatar_url || anonAvatar} alt="" onError={handleImageError} />
                      </div>
                      <span className={styles.userName}>{item.is_me ? t('ratingTable.you') : item.user_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={clsx(styles.amountBody, styles.td)}>
                    {formatBalance(item.amount)} {getCurrencySymbol(item.currency)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        {hasItems && (
          <TableFooter className={styles.tFooter}>
            {isSkeleton ? (
              <TableRow className={styles.loadingRow}>
                <td className={clsx(styles.loadingCell, styles.td)} colSpan={headerData.length}>
                  <div className={styles.loadingContainer}>
                    <Spinner />
                  </div>
                </td>
              </TableRow>
            ) : (
              leaderboardData?.me && (
                <TableRow>
                  <TableHead className={clsx(styles.th, styles.placeFooter)}>
                    {leaderboardData.me.place ?? '-'}
                  </TableHead>
                  <TableCell className={clsx(styles.userBody, styles.td)}>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        <img src={me?.avatar_url || anonAvatar} alt="" onError={handleImageError} />
                      </div>
                      <span className={styles.userName}>{t('ratingTable.you')}</span>
                    </div>
                  </TableCell>
                  <TableHead className={clsx(styles.th, styles.amountFooter)}>
                    {formatBalance(leaderboardData.me.amount)} {getCurrencySymbol(leaderboardData.me.currency)}
                  </TableHead>
                </TableRow>
              )
            )}
          </TableFooter>
        )}
      </Table>
    </div>
  );
};
