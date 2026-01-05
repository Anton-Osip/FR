export {
  showcaseApi,
  useGetShowcaseGamesQuery,
  useLazyGetShowcaseGamesQuery,
  useGetBettingTableBetsLatestQuery,
  useGetBettingTableBetsMyQuery,
  useGetBettingTableBetsBigWinsQuery,
} from './api/showcaseApi';
export { useBettingTableWebSocket } from './model/useBettingTableWebSocket';
export type {
  ShowcaseGamesResponse,
  GetShowcaseGamesParams,
  BettingTableBetsLatestResponse,
  GetBettingTableBetsLatestParams,
  BettingTableBetsMeta,
  ShowcaseGamesMeta,
  SortType,
  SortDirection,
} from './model';
