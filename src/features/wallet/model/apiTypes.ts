export interface Media {
  type: 'image' | 'lottie';
  url: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  precision: number;
  icon: Media | null;
}

export interface Field {
  code: 'full_name' | 'phone' | 'card' | 'bank' | 'amount_fiat' | 'amount_crypto' | 'address' | 'memo';
  required: boolean;
}

export interface Fee {
  enabled: string;
  type: string;
  percent: string;
  fixed: string;
  fixed_currency_code: string;
  fee_mode: string;
}

export interface FiatDepositMethod {
  code: string;
  title: string;
  media: Media | null;
  currency: Currency;
  min: number | null;
  max: number | null;
  fields: Field[];
  fee: Fee | null;
}

export interface CryptoDepositMethod {
  code: string;
  title: string;
  currency: Currency;
  network: string;
  media: Media | null;
  min: string;
  fields: Field[];
  fee: Fee | null;
}

export interface TelegramAsset {
  code: string;
  title: string;
  currency: Currency;
  network: string;
  media: Media | null;
  min: string;
  max: string;
  fields: Field[];
  fee: Fee | null;
}

export interface TelegramDepositMethod {
  code: string;
  title: string;
  assets: TelegramAsset[];
}

export interface WalletDepositMethodsResponse {
  fiat: FiatDepositMethod[];
  crypto: CryptoDepositMethod[];
  telegram: TelegramDepositMethod[];
}

export interface FiatWithdrawMethod {
  code: string;
  title: string;
  media: Media | null;
  currency: Currency;
  min: number | null;
  max: number | null;
  fields: Field[];
  fee: Fee | null;
}

export interface CryptoWithdrawMethod {
  code: string;
  title: string;
  currency: Currency;
  network: string;
  media: Media | null;
  min: string;
  fields: Field[];
  fee: Fee | null;
}

export interface TelegramWithdrawAsset {
  code: string;
  title: string;
  currency: Currency;
  network: string;
  media: Media | null;
  min: string;
  max: string;
  fields: Field[];
  fee: Fee | null;
}

export interface TelegramWithdrawMethod {
  code: string;
  title: string;
  assets: TelegramWithdrawAsset[];
}

export interface WalletWithdrawMethodsResponse {
  fiat: FiatWithdrawMethod[];
  crypto: CryptoWithdrawMethod[];
  telegram: TelegramWithdrawMethod[];
}

export interface WalletWithdrawBank {
  code: string;
  title: string;
  icon: Media | null;
}

export interface WalletWithdrawBanksResponse {
  method: string;
  amount: number;
  currency: Currency;
  banks: WalletWithdrawBank[];
}

export interface PhoneCountry {
  iso2: string;
  dial_code: string;
  name: string;
  icon: Media;
}

export interface WalletPhoneCountriesResponse {
  q: string;
  limit: number;
  offset: number;
  total: number;
  items: PhoneCountry[];
}

export interface WalletPhoneCountriesParams {
  q?: string;
  limit?: number;
  offset?: number;
}

export type WithdrawEligibilityReason =
  | 'invalid_input'
  | 'method_not_found'
  | 'method_disabled'
  | 'amount_out_of_bounds'
  | 'insufficient_wager';

export interface WalletWithdrawEligibilityParams {
  method: string;
  amount: string;
  asset_code?: string;
  fields?: string;
}

interface AccountWithdraw {
  currency: Currency;
  requested: string;
  payout: string;
  hold: string;
  fee: string;
}

export interface WalletWithdrawEligibilityResponse {
  eligible: boolean;
  withdrawable: number;
  withdrawable_currency: Currency;
  fee_aware_withdrawable: string;
  bonus_will_burn: boolean;
  reason: WithdrawEligibilityReason | string;
  missing_fields: string[];
  invalid_fields: string[];
  requested: number | null;
  account: AccountWithdraw | null;
  fee_info: string | null;
}

export interface WalletWithdrawRequest {
  method: string;
  amount: string;
  asset_code: string | null;
  fields?: Record<string, unknown>;
}

export interface WalletWithdrawResponse {
  withdraw_uuid: string;
  status: string;
  created_at: string;
  requested: string;
  account: string;
  fee_info: string;
  fee_mode: string;
  fee_percent: string;
  reason: string;
  missing_fields: string;
  invalid_fields: string;
}

export interface WalletDepositActiveParams {
  method: string;
  asset_code?: string | null;
  amount?: string | null;
}

export interface WalletDepositAmount {
  currency: Currency;
  amount: string;
}

export interface WalletDepositRequisites {
  card_number?: string;
  card_holder?: string;
  bank_name?: string;
  expires_at?: number;
  expires_in?: number;
  phone?: string;
  recipient_name?: string;
  qr_url?: string;
  pay_url?: string;
  address?: string;
  network?: string;
  memo_required?: boolean;
  memo?: string;
  min_amount?: string;
  bot_pay_url?: string;
  mini_app_url?: string;
}

export interface WalletDepositActiveResponse {
  uuid: string;
  status: string;
  created_at: number;
  requested: WalletDepositAmount;
  account: WalletDepositAmount;
  requisites: WalletDepositRequisites;
  amount_changed: boolean;
}

export interface WalletDepositRequest {
  method: string;
  amount?: string | null;
  asset_code?: string | null;
}

export interface WalletDepositResponse {
  uuid: string;
  status: string;
  created_at: number;
  requested: WalletDepositAmount;
  account: WalletDepositAmount;
  requisites: WalletDepositRequisites;
  amount_changed: boolean;
}

export type WalletTransactionKind = 'deposit' | 'withdrawal';

export type WalletTransactionStatus = 'success' | 'pending' | 'rejected';

export interface WalletTransactionRequisitesTelegram {
  bot_pay_url: string;
  mini_app_url: string | null;
}
export interface WalletTransactionRequisitesCryptoStatic {
  address: string;
  network: string;
  memo_required: boolean | null;
  memo: string | null;
  min_amount: string | null;
}
export interface WalletTransactionRequisitesFiat {
  card_number: string | null;
  card_holder: string | null;
  bank_name: string | null;
  phone: string | null;
  recipient_name: string | null;
  qr_url: string | null;
  pay_url: string | null;
  expires_at: number | null;
  expires_in: number | null;
}

export interface WalletTransaction {
  uuid: string;
  kind: WalletTransactionKind;
  amount: string;
  currency: Currency;
  created_at: number;
  status: WalletTransactionStatus;
  requisites?:
    | WalletTransactionRequisitesTelegram
    | WalletTransactionRequisitesCryptoStatic
    | WalletTransactionRequisitesFiat
    | null;
}

export interface WalletTransactionsResponse {
  items: WalletTransaction[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface GetWalletTransactionsParams {
  limit?: number;
  cursor?: string | null;
}
