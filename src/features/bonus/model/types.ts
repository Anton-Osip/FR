import type { Currency } from '@/shared/model/types/currency';
import { Game } from '@entities/game';

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

interface FreespinsInterface {
  quantity: number;
  slot: Game | null;
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
  slot: Game | null;
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
  slot?: Game | null;
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
