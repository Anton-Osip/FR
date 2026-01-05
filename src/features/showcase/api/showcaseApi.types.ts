import type { Bet } from '@/entities/bet';

// WebSocket Events
export type BettingTableLatestEvent = {
  type: 'betting_table_latest';
  payload: {
    data: Bet;
  };
};

export type BettingTableLatestReadyEvent = {
  type: 'ready';
};

export type BettingTableLatestPingEvent = {
  type: 'ping';
};

export type BettingTableBigWinsEvent = {
  type: 'betting_table_big_wins';
  payload: {
    data: Bet;
  };
};

export type BettingTableBigWinsReadyEvent = {
  type: 'ready';
};

export type BettingTableBigWinsPingEvent = {
  type: 'ping';
};

export type BettingTableMyEvent = {
  type: 'betting_table_my';
  payload: {
    data: Bet;
  };
};

export type BettingTableMyReadyEvent = {
  type: 'ready';
};

export type BettingTableMyPingEvent = {
  type: 'ping';
};
