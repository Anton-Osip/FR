import type { ElementType } from 'react';

import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp.tsx';

import { CryptoIcon } from './CryptoIcon';

import type { CryptoWithdrawMethod, TelegramWithdrawAsset, WithdrawMethod } from '@features/wallet/model';
import type { WalletDepositMethodsResponse } from '@features/wallet/model/apiTypes';

// Вспомогательная функция для создания элемента меню
export const createMenuItem = (
  code: string,
  network: string,
  title: string,
  iconUrl: string | null | undefined,
): DropdownMenuItems => {
  const IconComponent: ElementType | undefined = iconUrl
    ? ({ className }: { className?: string }) => <CryptoIcon url={iconUrl} alt={title} className={className} />
    : undefined;

  return {
    id: `${code}-${network}`,
    title: `${title} (${network})`,
    icon: IconComponent,
  };
};

// Type guard для проверки метода с сетью
export const hasNetwork = (method: WithdrawMethod): method is CryptoWithdrawMethod | TelegramWithdrawAsset => {
  return 'network' in method;
};

// Нормализация числа: заменяет запятую на точку, убирает пробелы и преобразует в число
const parseAmount = (value: string): number => {
  if (!value) return NaN;
  const normalized = value.toString().trim().replace(',', '.');

  return Number(normalized);
};

// Проверка валидности суммы
export const isValidAmount = (amount: string, minAmount: string): boolean => {
  // Проверяем, что amount введен
  if (!amount || amount.trim() === '' || amount === '0') {
    return false;
  }

  const numAmount = parseAmount(amount);

  // Если amount невалидное число, возвращаем false
  if (isNaN(numAmount) || numAmount <= 0) {
    return false;
  }

  // Если minAmount не указан или пустой, считаем что минимум = 0
  if (!minAmount || minAmount.trim() === '') {
    return true;
  }

  const numMinAmount = parseAmount(minAmount);

  // Если minAmount невалидное число, игнорируем проверку минимума
  if (isNaN(numMinAmount)) {
    return true;
  }

  return numAmount >= numMinAmount;
};

// Получение параметров для crypto депозита
const getCryptoDepositParams = (
  selectedMethod: WithdrawMethod,
  amount: string,
): { method: string; amount: string; asset_code: string | null } => {
  return {
    method: selectedMethod.code,
    amount,
    asset_code: hasNetwork(selectedMethod) ? selectedMethod.network : null,
  };
};

// Получение параметров для telegram депозита
const getTelegramDepositParams = (
  selectedMethod: WithdrawMethod,
  depositMethods: WalletDepositMethodsResponse,
  amount: string,
): { method: string; amount: string; asset_code: string | null } => {
  let telegramMethodCode: string | null = null;

  if (hasNetwork(selectedMethod)) {
    for (const telegramMethod of depositMethods.telegram || []) {
      const asset = telegramMethod.assets.find(
        a => a.code === selectedMethod.code && a.network === selectedMethod.network,
      );

      if (asset) {
        telegramMethodCode = telegramMethod.code;
        break;
      }
    }
  }

  return {
    method: telegramMethodCode || selectedMethod.code,
    amount,
    asset_code: hasNetwork(selectedMethod) ? selectedMethod.code : null,
  };
};

// Определение типа метода и получение параметров для депозита
export const getDepositParams = (
  selectedMethod: WithdrawMethod,
  depositMethods: WalletDepositMethodsResponse,
  amount: string,
): { method: string; amount: string; asset_code: string | null } => {
  const isCryptoMethod = depositMethods.crypto?.some(
    m => m.code === selectedMethod.code && hasNetwork(selectedMethod) && m.network === selectedMethod.network,
  );

  if (isCryptoMethod) {
    return getCryptoDepositParams(selectedMethod, amount);
  }

  return getTelegramDepositParams(selectedMethod, depositMethods, amount);
};

// Получение параметров для проверки активного депозита (без amount)
export const getDepositActiveParams = (
  selectedMethod: WithdrawMethod,
  depositMethods: WalletDepositMethodsResponse,
): { method: string; asset_code: string | null } | null => {
  if (!selectedMethod || !depositMethods) {
    return null;
  }

  // Ищем родительский telegram метод
  let telegramMethodCode: string | null = null;

  if (hasNetwork(selectedMethod)) {
    for (const telegramMethod of depositMethods.telegram || []) {
      const asset = telegramMethod.assets.find(
        a => a.code === selectedMethod.code && a.network === selectedMethod.network,
      );

      if (asset) {
        telegramMethodCode = telegramMethod.code;
        break;
      }
    }
  }

  return {
    method: telegramMethodCode || selectedMethod.code,
    asset_code: hasNetwork(selectedMethod) ? selectedMethod.code : null,
  };
};
