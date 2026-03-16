import type { GetLinksResolveParams } from '../model/types';

function getWebOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
}

export function buildGetLinksResolveQueryString(params: GetLinksResolveParams): string {
  const searchParams = new URLSearchParams();

  if (params.host !== undefined && params.host !== null) {
    searchParams.append('host', params.host);
  } else {
    searchParams.append('host', getWebOrigin());
  }
  if (params.region_key !== undefined && params.region_key !== null) {
    searchParams.append('region_key', params.region_key);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}
