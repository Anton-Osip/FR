import type {
  WalletDepositMethodsResponse,
  WalletDepositActiveParams,
  WalletDepositActiveResponse,
  WalletDepositRequest,
  WalletDepositResponse,
  WalletWithdrawBanksResponse,
  WalletWithdrawMethodsResponse,
  WalletPhoneCountriesResponse,
  WalletPhoneCountriesParams,
  WalletWithdrawEligibilityParams,
  WalletWithdrawEligibilityResponse,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
  WalletTransactionsResponse,
  GetWalletTransactionsParams,
  WalletTransaction,
} from '../model';

import {
  buildWalletPhoneCountriesQueryString,
  buildWalletWithdrawEligibilityQueryString,
  buildWalletDepositActiveQueryString,
  buildWalletTransactionsQueryString,
} from './walletApi.helpers';

import {
  baseApi,
  type BaseQueryFn,
  executeApiRequest,
  getCookie,
  fetchJSON,
  FETCH_TIMEOUT_EXTENDED_MS,
} from '@/shared/api';
import { BFF } from '@/shared/config';

const DEFAULT_TRANSACTIONS_PARAMS: GetWalletTransactionsParams = {
  limit: 50,
  cursor: null,
};

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${BFF}/ops/healthz`, {
      method: 'GET',
      credentials: 'include',
    }).catch(() => {});
  }

  return getCookie('csrf') || '';
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getWalletDepositMethods: builder.query<WalletDepositMethodsResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<WalletDepositMethodsResponse>(
          {
            endpointName: 'wallet.deposit.methods',
            url: `${BFF}/api/v1/wallet/deposit/methods`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['WalletDepositMethods'],
    }),
    getWalletDepositActive: builder.query<WalletDepositActiveResponse, WalletDepositActiveParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = buildWalletDepositActiveQueryString(params);

        return executeApiRequest<WalletDepositActiveResponse>(
          {
            endpointName: 'wallet.deposit.active',
            url: `${BFF}/api/v1/wallet/deposit/active${queryString}`,
            method: 'GET',
            logData: {
              payment_method: params.method,
              asset_code: params.asset_code,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Wallet'],
    }),
    getWalletWithdrawMethods: builder.query<WalletWithdrawMethodsResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<WalletWithdrawMethodsResponse>(
          {
            endpointName: 'wallet.withdraw.methods',
            url: `${BFF}/api/v1/wallet/withdraw/methods`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['WalletWithdrawMethods'],
    }),
    getWalletWithdrawBanks: builder.query<WalletWithdrawBanksResponse, { method: string; amount: number }>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<WalletWithdrawBanksResponse>(
          {
            endpointName: 'wallet.withdraw.banks',
            url: `${BFF}/api/v1/wallet/withdraw/banks?method=${encodeURIComponent(
              params.method,
            )}&amount=${params.amount}`,
            method: 'GET',
            logData: { payment_method: params.method, amount: params.amount },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Wallet'],
    }),
    getWalletPhoneCountries: builder.query<WalletPhoneCountriesResponse, WalletPhoneCountriesParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = buildWalletPhoneCountriesQueryString(params);

        return executeApiRequest<WalletPhoneCountriesResponse>(
          {
            endpointName: 'wallet.phone.countries',
            url: `${BFF}/api/v1/wallet/phone/countries${queryString}`,
            method: 'GET',
            logData: {
              q: params.q,
              limit: params.limit,
              offset: params.offset,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Wallet'],
    }),
    getWalletWithdrawEligibility: builder.query<WalletWithdrawEligibilityResponse, WalletWithdrawEligibilityParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = buildWalletWithdrawEligibilityQueryString(params);

        return executeApiRequest<WalletWithdrawEligibilityResponse>(
          {
            endpointName: 'wallet.withdraw.eligibility',
            url: `${BFF}/api/v1/wallet/withdraw/eligibility${queryString}`,
            method: 'GET',
            logData: {
              payment_method: params.method,
              amount: params.amount,
              asset_code: params.asset_code,
              fields: params.fields,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Wallet'],
    }),
    deposit: builder.mutation<WalletDepositResponse, WalletDepositRequest>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<WalletDepositResponse>(
          {
            endpointName: 'wallet.deposit',
            url: `${BFF}/api/v1/wallet/deposit`,
            method: 'POST',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            timeout: FETCH_TIMEOUT_EXTENDED_MS,
            logData: {
              payment_method: params.method,
              amount: params.amount,
              asset_code: params.asset_code,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      invalidatesTags: ['Wallet', 'WalletTransactions'],
    }),
    withdraw: builder.mutation<WalletWithdrawResponse, WalletWithdrawRequest>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<WalletWithdrawResponse>(
          {
            endpointName: 'wallet.withdraw',
            url: `${BFF}/api/v1/wallet/withdraw`,
            method: 'POST',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            timeout: FETCH_TIMEOUT_EXTENDED_MS,
            logData: {
              paymentMethod: params.method,
              amount: params.amount,
              asset_code: params.asset_code,
              hasFields: !!params.fields,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      invalidatesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query<WalletTransactionsResponse, GetWalletTransactionsParams | void>({
      queryFn: async (arg, _queryApi, _extraOptions, baseQuery) => {
        const params: GetWalletTransactionsParams = arg ?? DEFAULT_TRANSACTIONS_PARAMS;
        const queryString = buildWalletTransactionsQueryString(params);

        return executeApiRequest<WalletTransactionsResponse>(
          {
            endpointName: 'wallet.transactions',
            url: `${BFF}/api/v1/wallet/transactions${queryString}`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: () => [{ type: 'WalletTransactions', id: 'LIST' }, 'WalletTransactions'],
    }),
    getWalletTransactionByUuid: builder.query<WalletTransaction, { uuid: string }>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<WalletTransaction>(
          {
            endpointName: 'wallet.transaction.details',
            url: `${BFF}/api/v1/wallet/transactions/${params.uuid}`,
            method: 'GET',
            logData: {
              uuid: params.uuid,
            },
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: (_result, _error, arg) => [{ type: 'WalletTransactions', id: arg.uuid }],
    }),
  }),
});

export const {
  useGetWalletDepositMethodsQuery,
  useGetWalletDepositActiveQuery,
  useLazyGetWalletDepositActiveQuery,
  useDepositMutation,
  useGetWalletWithdrawMethodsQuery,
  useGetWalletWithdrawBanksQuery,
  useGetWalletPhoneCountriesQuery,
  useLazyGetWalletPhoneCountriesQuery,
  useGetWalletWithdrawEligibilityQuery,
  useLazyGetWalletWithdrawEligibilityQuery,
  useWithdrawMutation,
  useGetWalletTransactionsQuery,
  useLazyGetWalletTransactionsQuery,
  useGetWalletTransactionByUuidQuery,
  useLazyGetWalletTransactionByUuidQuery,
} = walletApi;
