import { FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { BettingTableBetItem } from '@shared/model';
import { Table, TableBody, TableHead, TableHeader } from '@shared/ui';

import styles from './BettingTable.module.scss';
import { BettingTableBody } from './BettingTableBody';

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
            <TableHead key={item.id} className={clsx(styles.th, styles[item.id])}>
              {item.label}
            </TableHead>
          );
        })}
      </TableHeader>
      <TableBody>
        <BettingTableBody
          itemsWithId={itemsWithId}
          isLoading={isLoading ?? false}
          items={items}
          headerCount={headerData.length}
          emptyMessage={t('betsSection.table.nothingFound')}
        />
      </TableBody>
    </Table>
  );
};
