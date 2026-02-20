import type { Currency } from '@/shared/model/types/currency';

export interface Bet {
  uuid?: string;
  user_name: string;
  avatar_url: string;
  game_title: string;
  game_image_url: string;
  game_uuid: string;
  stake: number;
  payout: number;
  currency: Currency;
  multiplier: number;
}
