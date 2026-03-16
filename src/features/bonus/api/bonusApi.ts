import {
  RedeemPromoRequest,
  CashbackResponse,
  ClaimCashbackRequest,
  ClaimCashbackResponse,
  BonusNotificationsResponse,
  PromoResponse,
  RedeemPromoError,
  BonusOverviewResponse,
  BonusChoiceResponse,
  UpdateBonusChoiceRequest,
} from '../model/types';

import { baseApi, type BaseQueryFn, executeApiRequest, getCookie, fetchJSON } from '@/shared/api';
import { getBFF } from '@/shared/config';

async function ensureCsrf(): Promise<string> {
  if (!getCookie('csrf')) {
    await fetchJSON(`${getBFF()}/ops/healthz`, {
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
            url: `${getBFF()}/api/v1/bonus/promos/redeem`,
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
      invalidatesTags: ['Overview'],
    }),
    getBonusOverview: builder.query<BonusOverviewResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<BonusOverviewResponse>(
          {
            endpointName: 'bonus.overview',
            url: `${getBFF()}/api/v1/bonus/overview`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Overview'],
    }),
    getBonusChoice: builder.query<BonusChoiceResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<BonusChoiceResponse>(
          {
            endpointName: 'bonus.choice',
            url: `${getBFF()}/api/v1/bonus/choice`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['Choice'],
    }),

    putBonusChoice: builder.mutation<BonusChoiceResponse, UpdateBonusChoiceRequest>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const csrf = await ensureCsrf();

        return executeApiRequest<BonusChoiceResponse>(
          {
            endpointName: 'bonus.choice.update',
            url: `${getBFF()}/api/v1/bonus/choice`,
            method: 'PUT',
            body: params,
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrf,
            },
            logData: { choice: params.choice },
          },
          baseQuery as BaseQueryFn,
        );
      },
      async onQueryStarted(params, { queryFulfilled, dispatch }) {
        // Оптимистичный апдейт: обновляем кэш сразу
        const patchResult = dispatch(
          bonusApi.util.updateQueryData('getBonusChoice', undefined, draft => {
            if (draft) {
              // eslint-disable-next-line no-param-reassign
              draft.ui_choice = params.choice;
            }
          }),
        );

        try {
          const { data } = await queryFulfilled;

          // Обновляем реальными данными с сервера
          dispatch(bonusApi.util.updateQueryData('getBonusChoice', undefined, () => data));
        } catch {
          // При ошибке откатываем оптимистичный апдейт
          patchResult.undo();
        }
      },
    }),

    getCashback: builder.query<CashbackResponse, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<CashbackResponse>(
          {
            endpointName: 'bonus.cashback',
            url: `${getBFF()}/api/v1/bonus/cashback`,
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
            url: `${getBFF()}/api/v1/bonus/cashback/claim?cashback_type=${params.cashback_type}`,
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
            url: `${getBFF()}/api/v1/bonus/notifications`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['BonusNotifications'],
    }),
  }),
});

export const {
  useGetBonusOverviewQuery,
  useGetBonusChoiceQuery,
  usePutBonusChoiceMutation,
  useRedeemPromoMutation,
  useGetCashbackQuery,
  useClaimCashbackMutation,
  useGetBonusNotificationsQuery,
} = bonusApi;
