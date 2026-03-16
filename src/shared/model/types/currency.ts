import { Media } from '@features/wallet';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  precision: number;
  icon?: Media | string | null;
}
