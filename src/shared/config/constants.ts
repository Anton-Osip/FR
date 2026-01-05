export const SOCKET_EVENTS = {
  BETTING_TABLE_LATEST: 'betting_table_latest',
  BETTING_TABLE_BIG_WINS: 'betting_table_big_wins',
  BETTING_TABLE_MY: 'betting_table_my',
} as const;

export const SOCKET_PATHS = {
  LATEST: '/api/v1/showcase/betting_table/ws/latest',
  BIG_WINS: '/api/v1/showcase/betting_table/ws/big-wins',
  MY: '/api/v1/showcase/betting_table/ws/my',
  BALANCE: '/api/v1/users/ws/balance',
} as const;

export type SocketEvents = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
export type SocketPaths = (typeof SOCKET_PATHS)[keyof typeof SOCKET_PATHS];
