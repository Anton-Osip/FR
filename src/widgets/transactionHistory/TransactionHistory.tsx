import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { useInfiniteScroll } from '@shared/lib';
import { EmptyState, Spinner } from '@shared/ui';

import { OperationDetailsModal } from '@widgets/operationDetailsModal';

import { INFINITE_SCROLL_ROOT_MARGIN, INFINITE_SCROLL_THRESHOLD, TRANSACTIONS_PAGE_SIZE } from './constants';
import { transformTransactions } from './helpers';
import styles from './TransactionHistory.module.scss';
import { TransactionItem } from './TransactionItem';

import { walletApi, type WalletTransaction } from '@features/wallet';

export const TransactionHistory: FC = () => {
  const { t } = useTranslation('profile');
  const gridRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [operationDetailsModalIsOpen, setOperationDetailsModalIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [fetchTransactions, { isLoading: isInitialLoading }] = walletApi.useLazyGetWalletTransactionsQuery();

  // Подписываемся на изменения для автоматического обновления
  const { data: freshData } = walletApi.useGetWalletTransactionsQuery({ limit: TRANSACTIONS_PAGE_SIZE, cursor: null });

  const loadTransactions = useCallback(
    async (nextCursor: string | null = null) => {
      if (isLoadingMore) return;

      setIsLoadingMore(true);
      try {
        const result = await fetchTransactions({ limit: TRANSACTIONS_PAGE_SIZE, cursor: nextCursor }).unwrap();

        setAllTransactions(prev => (nextCursor ? [...prev, ...result.items] : result.items));
        setCursor(result.next_cursor);
        setHasMore(result.has_more);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [fetchTransactions, isLoadingMore],
  );

  // Обновляем транзакции когда приходят свежие данные из query
  useEffect(() => {
    if (freshData && freshData.items.length > 0) {
      setAllTransactions(freshData.items);
      setCursor(freshData.next_cursor);
      setHasMore(freshData.has_more);
    }
  }, [freshData]);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];

    return transformTransactions(allTransactions);
  }, [allTransactions]);

  const transactionsMap = useMemo(() => {
    return new Map(allTransactions.map(t => [t.uuid, t]));
  }, [allTransactions]);

  const loadMoreHandler = useCallback(() => {
    if (hasMore && !isLoadingMore && cursor) {
      loadTransactions(cursor);
    }
  }, [hasMore, isLoadingMore, cursor, loadTransactions]);

  const observerRef = useInfiniteScroll({
    onLoadMore: loadMoreHandler,
    hasMore,
    isLoading: isLoadingMore,
    root: gridRef.current,
    rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
    threshold: INFINITE_SCROLL_THRESHOLD,
  });

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
  }, [groupedTransactions]);

  return (
    <>
      <div className={styles.transactionHistory}>
        <div className={clsx(styles.shadow, !isScrolledToBottom && !isInitialLoading && styles.shadowVisible)} />

        <h3 className={styles.title}>{t('transactionHistory.title')}</h3>
        <div className={styles.scroll}>
          <div ref={gridRef} className={styles.grid}>
            {isInitialLoading && (
              <div className={styles.loading}>
                <Spinner />
              </div>
            )}
            {!isInitialLoading && allTransactions.length === 0 && <EmptyState title={t('transactionHistory.empty')} />}
            {!isInitialLoading &&
              groupedTransactions.map(day => (
                <div key={day.date} className={styles.dayData}>
                  <h4 className={styles.dayTitle}>{day.date}</h4>
                  {day.items.map(item => {
                    const transaction = transactionsMap.get(String(item.id));

                    return (
                      <TransactionItem
                        key={item.id}
                        {...item}
                        onClick={() => {
                          if (transaction) {
                            setSelectedTransaction(transaction);
                            setOperationDetailsModalIsOpen(true);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ))}

            {hasMore && !isInitialLoading && (
              <div ref={observerRef} className={styles.observerTarget}>
                {isLoadingMore && (
                  <div className={styles.loadingMore}>
                    <Spinner />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <OperationDetailsModal
        open={operationDetailsModalIsOpen}
        onOpenChange={open => {
          setOperationDetailsModalIsOpen(open);
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
        transaction={selectedTransaction}
      />
    </>
  );
};
