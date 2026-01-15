export interface TabOption {
  label: string;
  value: string;
}

export const TAB_OPTIONS_SLOTS: TabOption[] = [
  { label: 'Крупные выигрыши', value: 'big_wins' },
  { label: 'Удачные ставки', value: 'lucky_bets' },
  { label: 'Лучшие за сегодня', value: 'today_best' },
];
