import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { getRankConfig, getNextRankConfig, type RankConfig } from '@shared/config';
import { PERCENTAGE_MULTIPLIER } from '@shared/config/constants';
import { getCurrencySymbol } from '@shared/lib';

import { useGetUserRankQuery, type RankType } from '@entities/user';

const MAX_AMOUNT_IN_K = 100;

type UseUserAmountProgressReturn = {
  t: TFunction<'profile', undefined>;
  current: number;
  maxAmount: number;
  progressPercent: number;
  currentRank: RankType | null;
  currentRankConfig: RankConfig;
  nextRankConfig: RankConfig | null;
  isRankLoading: boolean;
  currencySymbol: string;
};

export const useUserAmountProgress = (): UseUserAmountProgressReturn => {
  const { t } = useTranslation('profile');
  const { data: rankData, isLoading, isFetching } = useGetUserRankQuery();

  const isRankLoading = isLoading || isFetching;

  const totalWager = !isRankLoading && rankData ? rankData.total_wager : undefined;
  const nextGoal = !isRankLoading && rankData ? rankData.next_goal : undefined;
  const currentRank = !isRankLoading && rankData ? rankData.rank : null;

  const current = typeof totalWager === 'number' ? totalWager : 0;
  const maxAmount = typeof nextGoal === 'number' && nextGoal > 0 ? nextGoal : MAX_AMOUNT_IN_K;

  const rawProgressPercent = maxAmount > 0 && current >= 0 ? (current / maxAmount) * PERCENTAGE_MULTIPLIER : 0;
  const progressPercent = Math.max(0, Math.min(rawProgressPercent, PERCENTAGE_MULTIPLIER));

  const currentRankConfig = getRankConfig(currentRank);
  const nextRankConfig = getNextRankConfig(currentRank);
  const currencySymbol = getCurrencySymbol(rankData?.currency);

  return {
    t,
    current,
    maxAmount,
    progressPercent,
    currentRank,
    currentRankConfig,
    nextRankConfig,
    isRankLoading,
    currencySymbol,
  };
};
