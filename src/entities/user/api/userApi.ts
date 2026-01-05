import type { UserBalance, UserMe } from '../model/types';

import { baseApi } from '@/shared/api';
import { BFF } from '@/shared/config';

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUserMe: builder.query<UserMe, void>({
      query: () => ({
        url: `${BFF}/api/v1/users/me`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    getUserBalance: builder.query<UserBalance, void>({
      query: () => ({
        url: `${BFF}/api/v1/users/balance`,
        method: 'GET',
      }),
      providesTags: ['Balance'],
    }),
  }),
});

export const { useGetUserMeQuery, useGetUserBalanceQuery } = userApi;
