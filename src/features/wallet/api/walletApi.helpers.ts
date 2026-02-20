import type {
  WalletPhoneCountriesParams,
  WalletWithdrawEligibilityParams,
  WalletDepositActiveParams,
  GetWalletTransactionsParams,
} from '../model';

export function buildWalletTransactionsQueryString(params: GetWalletTransactionsParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.append('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function buildWalletPhoneCountriesQueryString(params: WalletPhoneCountriesParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.q !== undefined) {
    searchParams.append('q', params.q);
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', String(params.offset));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function buildWalletWithdrawEligibilityQueryString(params: WalletWithdrawEligibilityParams): string {
  const searchParams = new URLSearchParams();

  searchParams.append('method', params.method);
  searchParams.append('amount', params.amount);

  if (params.asset_code !== undefined) {
    searchParams.append('asset_code', params.asset_code);
  }
  if (params.fields !== undefined) {
    searchParams.append('fields', params.fields);
  }

  return `?${searchParams.toString()}`;
}

export function buildWalletDepositActiveQueryString(params: WalletDepositActiveParams): string {
  const searchParams = new URLSearchParams();

  searchParams.append('method', params.method);

  if (params.asset_code !== undefined && params.asset_code !== null) {
    searchParams.append('asset_code', params.asset_code);
  }

  if (params.amount !== undefined && params.amount !== null) {
    searchParams.append('amount', params.amount);
  }

  return `?${searchParams.toString()}`;
}
