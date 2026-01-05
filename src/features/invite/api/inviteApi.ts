import { feLog } from '@shared/lib';

import type { GetInviteLeaderboardParams, InviteLeaderboard, InviteOverview } from '../model/types';

import { baseApi } from '@/shared/api';
import { BFF } from '@/shared/config';

export const inviteApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getInviteOverview: builder.query<InviteOverview, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        try {
          feLog.info('invite.overview.start');

          const result = await baseQuery({
            url: `${BFF}/api/v1/invite/overview`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('invite.overview.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'invite_overview_failed',
              },
            };
          }

          const responseData = result.data as InviteOverview | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('invite.overview.success', {
            requestId,
            invitedCount: responseData?.invited_count,
            bonusSum: responseData?.bonus_sum,
          });

          return { data: responseData as InviteOverview };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('invite.overview.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
    }),

    getInviteLeaderboard: builder.query<InviteLeaderboard, GetInviteLeaderboardParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        try {
          const week = params?.week || 'this';

          feLog.info('invite.leaderboard.start', { week });

          const result = await baseQuery({
            url: `${BFF}/api/v1/invite/leaderboard?week=${week}`,
            method: 'GET',
          });

          if (result.error) {
            const errorData = result.error.data as { error?: string } | undefined;
            const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

            feLog.warn('invite.leaderboard.failed', {
              requestId,
              status: result.error.status,
              error: errorData?.error,
            });

            return {
              error: {
                status: result.error.status,
                data: result.error.data,
                error: errorData?.error || 'invite_leaderboard_failed',
              },
            };
          }

          const responseData = result.data as InviteLeaderboard | undefined;
          const requestId = (result.meta as { requestId?: string } | undefined)?.requestId;

          feLog.info('invite.leaderboard.success', {
            requestId,
            itemsCount: responseData?.items.length,
            myAmount: responseData?.me.amount,
          });

          return { data: responseData as InviteLeaderboard };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);

          feLog.error('invite.leaderboard.exception', { error: msg });

          return {
            error: {
              status: 0,
              data: { error: 'network_error' },
              error: 'network_error',
            },
          };
        }
      },
    }),
  }),
});

export const { useGetInviteOverviewQuery, useGetInviteLeaderboardQuery } = inviteApi;
