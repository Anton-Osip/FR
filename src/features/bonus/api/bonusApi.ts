import {
  RedeemPromoRequest,
  CashbackResponse,
  ClaimCashbackRequest,
  ClaimCashbackResponse,
  BonusNotificationsResponse,
  PromoResponse,
  RedeemPromoError,
} from '../model/types';

import { baseApi, type BaseQueryFn, executeApiRequest, getCookie, fetchJSON } from '@/shared/api';
import { BFF } from '@/shared/config';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${BFF}/ops/healthz`, {
      method: 'GET',
      credentials: 'include',
    }).catch(() => {});
  }

  return getCookie('csrf') || '';
}

export const bonusApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    redeemPromo: builder.mutation<PromoResponse, RedeemPromoRequest, RedeemPromoError>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        const result = await executeApiRequest<PromoResponse>(
          {
            endpointName: 'bonus.promos.redeem',
            url: `${BFF}/api/v1/bonus/promos/redeem`,
            method: 'POST',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            logData: { code: params.code },
          },
          baseQuery as BaseQueryFn,
        );

        if ('error' in result) {
          return {
            error: result.error as RedeemPromoError,
          };
        }

        return result;
      },
    }),

    getCashback: builder.query<CashbackResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<CashbackResponse>(
          {
            endpointName: 'bonus.cashback',
            url: `${BFF}/api/v1/bonus/cashback`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Cashback'],
    }),

    claimCashback: builder.mutation<ClaimCashbackResponse, ClaimCashbackRequest>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<ClaimCashbackResponse>(
          {
            endpointName: 'bonus.cashback.claim',
            url: `${BFF}/api/v1/bonus/cashback/claim?cashback_type=${params.cashback_type}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            logData: { cashback_type: params.cashback_type },
          },
          baseQuery as BaseQueryFn,
        );
      },
      invalidatesTags: ['Cashback', 'BonusNotifications'],
    }),

    getBonusNotifications: builder.query<BonusNotificationsResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<BonusNotificationsResponse>(
          {
            endpointName: 'bonus.notifications',
            url: `${BFF}/api/v1/bonus/notifications`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['BonusNotifications'],
    }),
  }),
});

export const { useRedeemPromoMutation, useGetCashbackQuery, useClaimCashbackMutation, useGetBonusNotificationsQuery } =
  bonusApi;
