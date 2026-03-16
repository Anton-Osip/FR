import type { ReactNode } from 'react';

export interface MenuItems {
  id: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
  notifications?: number;
}
