import type { UserBalance } from '../model/types';

export type BalanceEvent = {
  type: 'balance';
  data: UserBalance;
};

export type BalanceReadyEvent = {
  type: 'ready';
};

export type BalancePingEvent = {
  type: 'ping';
};

export type BalanceWebSocketEvent = BalanceEvent | BalanceReadyEvent | BalancePingEvent | UserBalance;
