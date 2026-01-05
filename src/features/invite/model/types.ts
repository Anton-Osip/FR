export interface InviteOverview {
  personal_ref_link: string;
  bonus_sum: number;
  invited_count: number;
}

export interface GetInviteLeaderboardParams {
  week?: 'this' | 'prev';
}

export interface LeaderboardItem {
  user_id: string;
  username?: string;
  amount: number;
  rank?: number;
}

export interface LeaderboardMe {
  amount: number;
}

export interface InviteLeaderboard {
  week: string;
  window_from_ts: number;
  window_to_ts: number;
  items: LeaderboardItem[];
  me: LeaderboardMe;
}
