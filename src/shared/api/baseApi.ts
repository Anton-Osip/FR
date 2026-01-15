import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

import { fetchJSON } from '@/shared/api';
import { CLIENT_VERSION } from '@/shared/config';

type CustomBaseQueryArgs = string | { url: string; method?: string; body?: unknown; headers?: Record<string, string> };
type CustomBaseQueryError = {
  status: number;
  data: unknown;
  error: string;
};

const customBaseQuery: BaseQueryFn<CustomBaseQueryArgs, unknown, CustomBaseQueryError> = async args => {
  const url = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : args.method || 'GET';
  const body = typeof args === 'string' ? undefined : args.body;
  const customHeaders = typeof args === 'string' ? {} : args.headers || {};

  const fetchOptions: RequestInit = {
    method,
    headers: {
      accept: 'application/json',
      'x-client-version': CLIENT_VERSION,
      ...customHeaders,
    },
    credentials: 'include',
  };

  if (body) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const result = await fetchJSON<unknown>(url, fetchOptions);

  if (result.ok) {
    return { data: result.data, meta: { requestId: result.requestId } };
  }

  return {
    error: {
      status: result.status,
      data: result.data,
      error: (result.data as { error?: string })?.error || 'unknown_error',
    },
    meta: { requestId: result.requestId },
  };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  tagTypes: ['User', 'Balance', 'Showcase', 'GeoCountry'],
  endpoints: () => ({}),
});
