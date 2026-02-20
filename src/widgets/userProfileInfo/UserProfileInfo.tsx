import { FC } from 'react';

import { formatBalance, getCurrencySymbol } from '@shared/lib';

import { UserBalance } from './UserBalance';
import { UserInfo } from './UserInfo';
import styles from './UserProfileInfo.module.scss';

import { useGetUserBalanceQuery, useGetUserMeQuery } from '@entities/user';
export const UserProfileInfo: FC = () => {
  const { data: balanceData, isLoading: balanceIsLoading, isFetching: balanceIsFetching } = useGetUserBalanceQuery();
  const { data: meData, isLoading: meIsLoading, isFetching: meIsFetching } = useGetUserMeQuery();

  const mainAmount = Number(balanceData?.cash ?? 0);
  const bonusAmount = Number(balanceData?.bonus ?? 0);
  const mainFormatted = formatBalance(Number.isFinite(mainAmount) ? mainAmount : 0);
  const bonusFormatted = formatBalance(Number.isFinite(bonusAmount) ? bonusAmount : 0);
  const currencySymbol = getCurrencySymbol(balanceData?.currency);
  const mainDisplay = `${mainFormatted} ${currencySymbol}`;
  const bonusDisplay = `${bonusFormatted} ${currencySymbol}`;
  const isBalanceLoading = balanceIsLoading || balanceIsFetching;
  const isMeLoading = meIsLoading || meIsFetching;

  const isLoading = isBalanceLoading || isMeLoading;

  const user = {
    id: meData?.user_id != null ? String(meData.user_id) : '-',
    username: (meData?.user_name || meData?.user_firstname) ?? '-',
    avatar: meData?.avatar_url,
  };

  return (
    <div className={styles.userInfo}>
      <UserInfo className={styles.userInfoComponent} user={user} isLoading={isLoading} />
      <UserBalance isMain amount={mainDisplay} isLoading={isBalanceLoading} className={styles.userBalance} />
      <UserBalance isMain={false} amount={bonusDisplay} isLoading={isBalanceLoading} className={styles.userBalance} />
    </div>
  );
};
