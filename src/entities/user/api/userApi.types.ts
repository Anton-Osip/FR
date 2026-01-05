import type { UserBalance } from '../model/types';

// WebSocket Events
export type BalanceEvent = {
  type: 'balance';
  data: UserBalance;
};

export type BalanceReadyEvent = {
  type: 'ready';
};

export type BalanceWebSocketEvent = BalanceEvent | BalanceReadyEvent | UserBalance;
