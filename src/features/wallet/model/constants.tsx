import type { ReactNode } from 'react';

import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp';
import { WalletIcon, WalletMinusIcon } from '@shared/ui/icons';

import { ReactComponent as FlagIcon } from '@assets/icons/flag.svg';
import type { ActiveTab, TabConfigBase } from '@features/wallet/model/types';

export const TAB_VALUES = {
  deposit: 'deposit',
  withdraw: 'withdraw',
} as const satisfies Record<ActiveTab, ActiveTab>;

export const DEFAULT_ACTIVE_TAB: ActiveTab = TAB_VALUES.deposit;

/**
 * Базовая конфигурация вкладок без иконок
 */
export const TABS_CONFIG_BASE: readonly TabConfigBase[] = [
  {
    id: '1',
    value: TAB_VALUES.deposit,
    labelKey: 'tabs.deposit',
  },
  {
    id: '2',
    value: TAB_VALUES.withdraw,
    labelKey: 'tabs.withdraw',
  },
] as const;

/**
 * Функция для получения иконки вкладки
 */
export const getTabIcon = (value: ActiveTab): ReactNode => {
  switch (value) {
    case TAB_VALUES.deposit:
      return <WalletIcon />;
    case TAB_VALUES.withdraw:
      return <WalletMinusIcon />;
    default:
      return null;
  }
};

/**
 * Type guard для проверки валидности значения вкладки
 */
export const isValidTab = (value: string): value is ActiveTab => {
  return value === TAB_VALUES.deposit || value === TAB_VALUES.withdraw;
};

/**
 * Дефолтный список валют для DropdownWallet / PaymentRegionSelector и т.п.
 */
export const DEFAULT_CURRENCY_ITEMS: DropdownMenuItems[] = [
  {
    id: 'rub',
    title: 'RUB',
    icon: FlagIcon,
  },
  {
    id: 'rub1',
    title: 'RUB1',
    icon: FlagIcon,
  },
  {
    id: 'rub2',
    title: 'RUB2',
    icon: FlagIcon,
  },
  {
    id: 'rub3',
    title: 'RUB3',
    icon: FlagIcon,
  },
  {
    id: 'rub4',
    title: 'RUB4',
    icon: FlagIcon,
  },
  {
    id: 'rub5',
    title: 'RUB5',
    icon: FlagIcon,
  },
  {
    id: 'rub6',
    title: 'RUB6',
    icon: FlagIcon,
  },
];
