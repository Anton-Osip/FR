export interface UserMe {
  user_id: number;
  user_firstname: string;
  user_name: string;
  block: number;
  is_hidden: number;
  avatar_url: string;
}

export interface UserBalance {
  balance: string;
  cash: string;
  bonus: string;
  revshare: string;
}

export type BalanceStreamPayload = {
  balance: number;
};

export interface UserGeoCountry {
  country_code: string;
  client_ip: string;
  ip_source: string;
}
