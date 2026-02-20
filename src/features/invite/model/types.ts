import type { Currency } from '@/shared/model/types/currency';

export type InviteWeek = 'this' | 'prev';

export interface InviteOverview {
  personal_ref_link: string;
  bonus_sum: number;
  invited_count: number;
  currency: Currency;
}

export interface GetInviteLeaderboardParams {
  week?: InviteWeek;
}

export interface LeaderboardItem {
  place: number;
  user_name: string;
  avatar_url: string;
  amount: number;
  currency: Currency;
  is_me: boolean;
}

export interface LeaderboardMe {
  place: number | null;
  amount: number;
  currency: Currency;
}

export interface InviteLeaderboard {
  week: InviteWeek;
  window_from_ts: number;
  window_to_ts: number;
  items: LeaderboardItem[];
  me: LeaderboardMe;
}
