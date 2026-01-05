export {
  showcaseApi,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
  useGetBettingTableBetsBigWinsQuery,
  useInitSlotMutation,
  useInitSlotDemoMutation,
} from './api/showcaseApi';
export type {
  ShowcaseGamesResponse,
  GetShowcaseGamesParams,
  BettingTableBetsLatestResponse,
  GetBettingTableBetsLatestParams,
  BettingTableBetsMeta,
  ShowcaseGamesMeta,
  SortType,
  SortDirection,
  InitSlotParams,
  InitSlotResponse,
  InitSlotDemoParams,
  InitSlotDemoResponse,
} from './model';
