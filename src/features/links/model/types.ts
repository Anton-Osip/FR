interface Links {
  terms: string | null;
  support: string | null;
  user_chat: string | null;
  news: string | null;
  affiliate: string | null;
}

export interface GetLinksResolveRequest {
  region_key: string;
  scope: string;
  resolved_by: string;
  host: string | null;
  links: Links;
}

export interface GetLinksResolveParams {
  host?: string | null;
  region_key?: string | null;
}
