export interface UserMe {
  user_id: number;
  username?: string | null;
  balance?: number | null;
  avatar_url?: string | null;
  user_firstname?: string | null;
}

export interface UserBalance {
  balance: number;
  cash: number;
  bonus: number;
  revshare: number;
}

export type BalanceStreamPayload = {
  balance: number;
};
