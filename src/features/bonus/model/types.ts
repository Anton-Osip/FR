import type { Currency } from '@/shared/model/types/currency';

export interface RedeemPromoRequest {
  code: string;
}

type PromoBaseType =
  | 'bonus'
  | 'freespins'
  | 'promo_deposit_fixed'
  | 'promo_deposit_percent'
  | 'promo_deposit_freespins';

type PromoBaseResponse = {
  code: string;
  type: PromoBaseType;
};

export interface ISlots {
  uuid: string;
  name: string;
  provider: string;
  image_url: string;
}

interface FreespinsInterface {
  quantity: number;
  slot: ISlots | null;
  denomination: string | null;
}

export type BonusRedeemResponseWeb = PromoBaseResponse & {
  type: 'bonus';
  status: 'credited';
  amount: string;
  currency: Currency;
  wager_mult: number;
  wager_ttl_days: number;
};

export type FreespinsRedeemResponseWeb = PromoBaseResponse & {
  type: 'freespins';
  quantity: number | null;
  denomination: string | null;
  valid_until: number | null;
  slot: ISlots | null;
  amount: string;
  currency: Currency;
  wager_mult: number | null;
  wager_ttl_days: number | null;
};

export type DepositReserveFundsWeb = PromoBaseResponse & {
  type: 'promo_deposit_fixed';
  status: 'reserved';
  min_deposit: number | null;
  ttl_hours: number | null;
  deadline_ts: number | null;
  wager_mult: number;
  wager_ttl_days: number;
  activation_ttl_sec: number;
  usage_ttl_sec: number;
  reward_type: 'funds';
  amount: string;
  currency: Currency;
};

export type DepositReservePercentWeb = PromoBaseResponse & {
  type: 'promo_deposit_percent';
  status: 'reserved';
  min_deposit: number | null;
  ttl_hours: number | null;
  deadline_ts: number | null;
  wager_mult: number;
  wager_ttl_days: number;
  activation_ttl_sec: number;
  usage_ttl_sec: number;
  reward_type: 'percent';
  percent: number;
  currency: Currency;
};

export type DepositReserveFreespinsWeb = PromoBaseResponse & {
  type: 'promo_deposit_freespins';
  status: 'reserved';
  min_deposit: number | null;
  ttl_hours: number | null;
  deadline_ts: number | null;
  wager_mult: number;
  wager_ttl_days: number;
  activation_ttl_sec: number;
  usage_ttl_sec: number;
  reward_type: 'freespins';
  freespins: FreespinsInterface;
  amount: string | null;
  currency: Currency;
};

export type PromoResponse =
  | BonusRedeemResponseWeb
  | FreespinsRedeemResponseWeb
  | DepositReserveFundsWeb
  | DepositReservePercentWeb
  | DepositReserveFreespinsWeb;

export interface CashbackStatus {
  status: string;
  since_ts: number;
}

export interface CashbackClaimable {
  amount: string;
  wager: string;
  currency: Currency;
  playtime_hours: number;
  claim_expires_in: number;
}

export interface CashbackInfo {
  type: 'weekly' | 'monthly';
  is_available: boolean;
  required_rank: string;
  percent: string;
  next_payout_in: number;
  status: CashbackStatus | null;
  claimable?: CashbackClaimable;
}

export interface CashbackResponse {
  user_rank: string;
  weekly: CashbackInfo;
  monthly: CashbackInfo;
}

export interface ClaimCashbackRequest {
  cashback_type: 'weekly' | 'monthly';
}

export interface ClaimCashbackResponse {
  status: 'claimed';
  type: 'weekly' | 'monthly';
  bonus_id: number;
  amount: string;
  wager: string;
  currency: Currency;
}

export interface BonusNotificationsResponse {
  has_cashback: boolean;
}

export interface CurrentPromo {
  code: string;
  type: 'promo_deposit_fixed' | 'promo_deposit_percent' | 'promo_deposit_freespins';
  reward_type?: 'funds' | 'percent' | 'freespins';
  amount?: string;
  percent?: number;
  freespins?: FreespinsInterface;
  min_deposit?: number | null;
  deadline_ts?: number | null;
  wager_mult: number;
  wager_ttl_days: number;
}

export interface RedeemPromoErrorDetailObject {
  code: string;
  current?: CurrentPromo;
  slot?: ISlots | null;
}

export type RedeemPromoErrorDetail = string | RedeemPromoErrorDetailObject;

export interface RedeemPromoErrorData {
  detail: RedeemPromoErrorDetail;
}

export interface RedeemPromoError {
  status: number;
  data: RedeemPromoErrorData;
  error: string;
}
export interface DepositCampaignStepConditions {
  wager_multiplier: string;
  activation_ttl_sec: number;
  usage_ttl_sec: number;
  withdraw_cap_mode: string;
  withdraw_cap_multiplier: string;
}

export interface DepositCampaignStep {
  step_index: number;
  status: string;
  reward_percent: string;
  conditions: DepositCampaignStepConditions;
  reward_type?: 'funds' | 'percent' | 'freespins';
  amount?: string;
}

interface DepositCampaign {
  is_active: boolean;
  paid_deposits_count: number;
  is_closed: boolean;
  next_step_index: number | null;
  steps: DepositCampaignStep[];
}

export interface PromoDeposit {
  has_active_reserve: boolean;
  promo_code?: string;
  reward_type?: 'funds' | 'percent' | 'freespins';
  min_deposit?: string;
  percent?: string;
  amount?: string;
  deadline_ts?: number | string;
  expires_in_sec?: number | string;
  wager_mult?: string;
  wager_ttl_days?: number;
  currency?: Currency;
  grant_id: number;
  grant_status: 'rejected' | 'pending' | 'resolved';
  can_activate: boolean;
  fs_quantity: boolean;
  fs_game_uuid: string;
  fs_slot_name: string;
  fs_slot_provider: string;
}

interface BonusOverviewSlotProvider {
  id: number;
  slug: string;
  name: string;
  supports_demo: boolean;
}

interface BonusOverviewSlot {
  uuid: string;
  name: string;
  slug: string;
  game_kind: string;
  image: string;
  provider: BonusOverviewSlotProvider;
  is_mobile: boolean;
  has_freespins: boolean;
  is_new: boolean;
  is_popular: boolean;
  is_featured: boolean;
}

interface BonusOverviewFreespin {
  promo_code: string;
  bonus_id: number;
  quantity_total: number;
  quantity_left: number;
  spins_used: number;
  valid_until: number;
  expires_in_sec: number;
  wager_multiplier: string;
  slot: BonusOverviewSlot;
}

interface BonusOverviewBonus {
  bonus_id: string;
  type: string;
  status: string;
  currency: string;
  balance: string;
  expires_in_sec: string;
  wager_multiplier: string;
  required_turnover: string;
  current_turnover: string;
  remaining_turnover: string;
  restrict_slots: string;
  withdraw_cap_mode: string;
  withdraw_cap_multiplier: string;
  withdraw_cap_fixed: string;
  promo_code: string;
}

interface BonusOverviewSummary {
  account_currency: Currency;
  bonus_total_balance: string;
  bonuses_count: number;
  freespins_count: number;
  has_promo_deposit_reserve: boolean;
}

export interface BonusOverviewResponse {
  deposit_campaign: DepositCampaign;
  promo_deposit: PromoDeposit;
  freespins: BonusOverviewFreespin[];
  bonuses: BonusOverviewBonus[];
  summary: BonusOverviewSummary;
}

export enum BonusUiChoice {
  None = 'none',
  DepositCampaign = 'deposit_campaign',
  PromoDeposit = 'promo_deposit',
}

export interface UpdateBonusChoiceRequest {
  choice: BonusUiChoice;
}

export interface BonusChoiceResponse {
  stored_choice: BonusUiChoice;
  ui_choice: BonusUiChoice;
  has_active_promo_deposit_reserve: boolean;
}
