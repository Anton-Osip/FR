export interface Bet {
  uuid?: string;
  user_name: string;
  avatar_url: string;
  game_title: string;
  game_image_url: string;
  stake: number;
  payout: number;
  multiplier: number;
}
