export enum UserVisibility {
  Visible = 1,
  Hidden = -1,
}

export enum UserBlock {
  NotBlocked = -1,
  Blocked = 1,
}
export interface UserMe {
  user_id: number;
  user_firstname: string;
  user_name: string;
  block: UserBlock;
  is_hidden: UserVisibility;
  avatar_url: string;
}

import type { Currency } from '@/shared/model/types/currency';

export type UserBalanceCurrency = Currency;

export interface UserBalance {
  balance: string;
  cash: string;
  bonus: string;
  revshare: string;
  currency: UserBalanceCurrency;
}

export type BalanceStreamPayload = {
  balance: number;
};

export interface UserGeoCountry {
  country_code: string;
  client_ip: string;
  ip_source: string;
}
export type RankType = 'bronze' | 'silver' | 'gold' | 'diamond';
export interface UserRank {
  rank: RankType | null;
  total_wager: number;
  next_goal: number;
  currency: UserBalanceCurrency;
}

export interface UpdateUserHiddenRequest {
  is_hidden: UserVisibility;
}
