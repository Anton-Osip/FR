import type { Bet } from '@/entities/bet';

// WebSocket Events
export type BettingTableLatestEvent = {
  type: 'betting_table_latest';
  payload: {
    data: Bet;
  };
};

export type BettingTableBigWinsEvent = {
  type: 'betting_table_big_wins';
  payload: {
    data: Bet;
  };
};

export type BettingTableMyEvent = {
  type: 'betting_table_my';
  payload: {
    data: Bet;
  };
};
