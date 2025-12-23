export interface UserMe {
  user_id: number;
  username?: string | null;
  balance?: number | null;
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
