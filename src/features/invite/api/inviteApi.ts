import { baseApi, type BaseQueryFn, executeApiRequest } from '@/shared/api';
import { getBFF } from '@/shared/config';
import type { InviteOverview } from '@/shared/model';
import type { GetInviteLeaderboardParams, InviteLeaderboard } from '@features/invite/model';

export const inviteApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getInviteOverview: builder.query<InviteOverview, void>({
      queryFn: async (_params, _queryApi, _extraOptions, baseQuery) => {
        return executeApiRequest<InviteOverview>(
          {
            endpointName: 'invite.overview',
            url: `${getBFF()}/api/v1/invite/overview`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
    }),

    getInviteLeaderboard: builder.query<InviteLeaderboard, GetInviteLeaderboardParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const week = params?.week || 'this';

        return executeApiRequest<InviteLeaderboard>(
          {
            endpointName: 'invite.leaderboard',
            url: `${getBFF()}/api/v1/invite/leaderboard?week=${week}`,
            method: 'GET',
            logData: { week },
          },
          baseQuery as BaseQueryFn,
        );
      },
    }),
  }),
});

export const { useGetInviteOverviewQuery, useGetInviteLeaderboardQuery } = inviteApi;
