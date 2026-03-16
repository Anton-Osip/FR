import { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { formatAmount, getCurrencySymbol } from '@shared/lib';
import { ArrowIcon } from '@shared/ui/icons';

import styles from './TransactionItem.module.scss';

import { type TransactionItemData, type TransactionStatus } from '@entities/transaction';

const getStatusClass = (status: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return styles.pending;
    case 'resolved':
      return styles.resolved;
    case 'rejected':
      return styles.rejected;
  }
};

export const TransactionItem: FC<TransactionItemData> = ({ type, time, amount, currency, status, onClick }) => {
  const { t } = useTranslation('profile');

  return (
    <div className={styles.item} onClick={onClick}>
      <div className={clsx(styles.image, type === 'in' && styles.down)}>
        <ArrowIcon />
      </div>
      <div className={styles.wrapper}>
        <div className={styles.row}>
          <span className={styles.type}>{t(`transactionHistory.types.${type}`)}</span>
          <span className={styles.amount}>
            {formatAmount(amount)} {getCurrencySymbol(currency)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.time}>{time}</span>
          <span className={clsx(styles.status, getStatusClass(status))}>
            {t(`transactionHistory.statuses.${status}`)}
          </span>
        </div>
      </div>
    </div>
  );
};
