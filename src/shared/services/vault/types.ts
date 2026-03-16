export interface VaultAuthResponse {
  auth: {
    client_token: string;
    lease_duration: number;
    renewable: boolean;
  };
}

export interface VaultRenewResponse {
  auth: {
    client_token: string;
    lease_duration: number;
    renewable: boolean;
  };
}

export interface VaultKVResponse<T = unknown> {
  data: {
    data: T;
    metadata: {
      created_time: string;
      custom_metadata?: Record<string, string>;
      deletion_time: string;
      destroyed: boolean;
      version: number;
    };
  };
}

export interface DomainConfig {
  bff_host: string;
  cookie_domain: string;
  csp?: {
    connect_src?: string[];
    img_src?: string[];
    script_src?: string[];
  };
  enabled: boolean;
  login_host: string;
  login_return_hosts: string[];
  name: string;
  origins?: string[];
  tg_bot_name: string;
  web_host: string;
}

export interface DomainsConfig {
  default_domain: string;
  domains: DomainConfig[];
  version: number;
}
