import { FC, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Table, Tabs, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@shared/ui';

import { getTableData } from '@widgets/ratingTable/mockTable';

import styles from './RatingTable.module.scss';

import { useGetInviteLeaderboardQuery } from '@features/invite';

interface RatingTableProps {
  className?: string;
}

const USER_ID = 1323992;

export const RatingTable: FC<RatingTableProps> = ({ className }) => {
  const { t } = useTranslation('invite');
  const tableData = useMemo(() => getTableData(t), [t]);
  const me = tableData.find(item => item.id === USER_ID);
  const [week, setWeek] = useState<'this' | 'prev'>('this');

  const { data: leaderboardData } = useGetInviteLeaderboardQuery({ week });

  console.log(leaderboardData);

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
    <div className={`${styles.ratingTable} ${className ?? ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('ratingTable.title')}</h2>
        <div className={styles.tabs}>
          <Tabs items={items} onChange={value => setWeek(value as 'this' | 'prev')} />
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
          {tableData.map(item => {
            return (
              <TableRow key={item.id} className={item.id === USER_ID ? styles.isMe : ''}>
                <TableCell className={`${styles.placeBody} ${styles.td}`}>{item.place}</TableCell>
                <TableCell className={`${styles.userBody} ${styles.td}`}>
                  <div className={styles.userCell}>
                    <span className={styles.userAvatar} />
                    <span className={styles.userName}>{item.id !== USER_ID ? item.user : t('ratingTable.you')}</span>
                  </div>
                </TableCell>
                <TableCell className={`${styles.amountBody} ${styles.td}`}>{item.amount} ₽</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className={styles.tFooter}>
          <TableRow>
            <TableHead className={`${styles.th} ${styles.placeFooter}`}>{me?.place}</TableHead>
            <TableCell className={`${styles.userBody} ${styles.td}`}>
              <div className={styles.userCell}>
                <span className={styles.userAvatar} />
                <span className={styles.userName}>{t('ratingTable.you')}</span>
              </div>
            </TableCell>
            <TableHead className={`${styles.th} ${styles.amountFooter}`}>{me?.amount} ₽</TableHead>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
