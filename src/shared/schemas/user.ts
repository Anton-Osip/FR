export interface UserMe {
  id: number;
  user_id: number;
  user_firstname: string | null;
  user_name: string | null;
  reg_date: number;
  balance: string | null;
  ref_id: number | null;
  type_pay: number | null;
  personal_ref_link: string | null;
  active: number;
  block: number;
  is_hidden: number;
  language_tag: string | null;
  country_code: string | null;
  region_key: string | null;
  region_title: string | null;
  region_emoji: string | null;
  webapp_url: string | null;
  images_url: string | null;
  language_locked: boolean;
  region_locked: boolean;
  avatar_url: string | null;
  locale_source: string | null;
  is_partner: boolean;
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
