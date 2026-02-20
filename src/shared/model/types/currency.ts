import { Media } from '@features/wallet';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  icon?: Media | string | null;
}
