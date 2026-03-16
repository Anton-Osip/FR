import { GetLinksResolveRequest, GetLinksResolveParams } from '../model/types';

import { baseApi, type BaseQueryFn, executeApiRequest } from '@/shared/api';
import { getBFF } from '@/shared/config';
import { buildGetLinksResolveQueryString } from '@features/links/api/linksApi.helpers.ts';

export const linksApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getLinksResolve: builder.query<GetLinksResolveRequest, GetLinksResolveParams>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const queryString = params ? buildGetLinksResolveQueryString(params) : '';

        return executeApiRequest<GetLinksResolveRequest>(
          {
            endpointName: 'links.resolve',
            url: `${getBFF()}/api/v1/links/resolve${queryString}`,
            method: 'GET',
          },
          baseQuery as BaseQueryFn,
        );
      },
      providesTags: ['LinksResolve'],
    }),
  }),
});

export const { useGetLinksResolveQuery } = linksApi;
