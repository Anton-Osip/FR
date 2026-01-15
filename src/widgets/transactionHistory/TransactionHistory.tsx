import { FC, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import { ArrowIcon } from '@shared/ui/icons';

import styles from './TransactionHistory.module.scss';

type TransactionType = 'in' | 'out';
type TransactionStatus = 'rejected' | 'pending' | 'resolved';

interface TransactionItem {
  id: number;
  type: TransactionType;
  time: string;
  amount: number;
  status: TransactionStatus;
}

interface TransactionGroup {
  date: string;
  items: TransactionItem[];
}

const data: TransactionGroup[] = [
  {
    date: '30 Декабря',
    items: [
      { id: 1, type: 'out', time: '13:10', amount: 5070, status: 'rejected' },
      { id: 2, type: 'in', time: '13:10', amount: 5070, status: 'pending' },
    ],
  },
  {
    date: '29 Декабря',
    items: [
      { id: 3, type: 'in', time: '13:10', amount: 5070, status: 'resolved' },
      { id: 4, type: 'in', time: '13:10', amount: 5070, status: 'resolved' },
      { id: 5, type: 'in', time: '13:10', amount: 5070, status: 'resolved' },
      { id: 6, type: 'in', time: '13:10', amount: 5070, status: 'resolved' },
    ],
  },
];

const getStatus = (status: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return 'Ожидание оплаты';
    case 'resolved':
      return 'Успешно';
    case 'rejected':
      return 'Отклонено';
  }
};

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

export const TransactionHistory: FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  useEffect(() => {
    const gridElement = gridRef.current;

    if (!gridElement) return;

    const checkScrollPosition = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = gridElement;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      setIsScrolledToBottom(isAtBottom);
    };

    checkScrollPosition();
    gridElement.addEventListener('scroll', checkScrollPosition);

    return () => {
      gridElement.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  return (
    <div className={styles.transactionHistory}>
      {!isScrolledToBottom && <div className={styles.shadow} />}

      <h3 className={styles.title}>История транзакций</h3>
      <div className={styles.scroll}>
        <div ref={gridRef} className={styles.grid}>
          {data.map(day => (
            <div key={day.date} className={styles.dayData}>
              <h4 className={styles.dayTitle}>{day.date}</h4>
              {day.items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={clsx(styles.image, item.type === 'in' && styles.down)}>
                    <ArrowIcon />
                  </div>
                  <div className={styles.wrapper}>
                    <div className={styles.row}>
                      <span className={styles.type}>{item.type === 'out' ? 'Вывод' : 'Пополнение'}</span>
                      <span className={styles.amount}>{item.amount}₽</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.time}>{item.time}</span>
                      <span className={clsx(styles.status, getStatusClass(item.status))}>{getStatus(item.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
