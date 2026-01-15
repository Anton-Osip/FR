import { FC, useMemo } from 'react';

import clsx from 'clsx';

import { formatAmount, formatMultiplier } from '@shared/lib/formatting';

import place1 from '../../../shared/assets/icons/place1.svg?url';
import place2 from '../../../shared/assets/icons/place2.svg?url';
import place3 from '../../../shared/assets/icons/place3.svg?url';

import styles from './PedestalItems.module.scss';

import type {
  SlotLeaderboardBigWinItem,
  SlotLeaderboardLuckyItem,
  SlotLeaderboardTodayBestItem,
} from '@features/showcase';

type LeaderboardItem = SlotLeaderboardBigWinItem | SlotLeaderboardLuckyItem | SlotLeaderboardTodayBestItem;

const PLACE_FIRST = 1;
const PLACE_SECOND = 2;
const PLACE_THIRD = 3;

const FIRST_PLACE_INDEX = 0;
const SECOND_PLACE_INDEX = 1;
const THIRD_PLACE_INDEX = 2;

interface PedestalItemsProps {
  className?: string;
  title?: string;
  containerClassName?: string;
  data?: LeaderboardItem[];
  isLoading?: boolean;
}

export const PedestalItems: FC<PedestalItemsProps> = ({ className, title, containerClassName, data, isLoading }) => {
  const items = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { place: PLACE_SECOND, item: null },
        { place: PLACE_FIRST, item: null },
        { place: PLACE_THIRD, item: null },
      ];
    }

    return [
      { place: PLACE_SECOND, item: data[SECOND_PLACE_INDEX] || null },
      { place: PLACE_FIRST, item: data[FIRST_PLACE_INDEX] || null },
      { place: PLACE_THIRD, item: data[THIRD_PLACE_INDEX] || null },
    ];
  }, [data]);

  return (
    <div className={clsx(styles.pedestalItemsWrapper, className)}>
      <div className={styles.pedestalItems}>
        <div className={styles.overflowContainer}>
          <div className={clsx(styles.left, styles.bg)} />
          <div className={clsx(styles.right, styles.bg)} />
        </div>
        {title && (
          <div className={styles.titleWrapper}>
            <h2 className={styles.title}>{title}</h2>
          </div>
        )}

        <div className={clsx(styles.container, containerClassName)}>
          {items.map(({ place, item }) => (
            <div key={place} className={styles.item}>
              <div className={styles.info}>
                <div className={styles.image}>
                  {isLoading ? (
                    <div className={styles.skeletonImage} />
                  ) : item?.avatar_url ? (
                    <img src={item.avatar_url} alt={item.user_name || ''} />
                  ) : (
                    <div className={styles.placeholder} />
                  )}
                </div>
                {isLoading ? (
                  <>
                    <p className={clsx(styles.name, styles.skeletonText)} />
                    <p className={clsx(styles.amount, styles.skeletonText)} />
                    <p className={clsx(styles.coefficient, styles.skeletonText)} />
                  </>
                ) : (
                  <>
                    <p className={styles.name}>{item?.user_name || '—'}</p>
                    <p className={styles.amount}>{item ? `${formatAmount(item.payout)} ₽` : '—'}</p>
                    <p className={styles.coefficient}>{item ? `x${formatMultiplier(item.multiplier)}` : '—'}</p>
                  </>
                )}
              </div>
              <div className={clsx(styles.place, styles[`place${place}`])}>
                <img
                  src={place === PLACE_FIRST ? place1 : place === PLACE_SECOND ? place2 : place3}
                  alt={`${place} место`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
