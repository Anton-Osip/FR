import { useCallback, useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@shared/api';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp.tsx';

import { createMenuItem, getDepositParams, hasNetwork, isValidAmount } from './helpers';

import { useGetWalletDepositMethodsQuery } from '@features/wallet';
import { useDepositMutation } from '@features/wallet/api/walletApi.ts';
import {
  selectDepositData,
  setDepositData,
  setSelectedWithdrawMethod,
  WalletDepositResponse,
  type WithdrawMethod,
} from '@features/wallet/model';

interface UseCryptoPaymentReturn {
  // Data
  selectedMethod: WithdrawMethod | null;
  telegramCryptoItems: DropdownMenuItems[];
  address: string;
  network: string;
  minAmount: string;
  amountIcon: string;
  cryptoCode: string;
  botPayUrl: string;
  miniAppUrl: string;
  minAmountLabel: string;
  selectedMethodId: string | undefined;

  depositData: WalletDepositResponse | null;

  // Loading states
  isLoading: boolean;
  isDepositLoading: boolean;

  // Handlers
  handleMethodChange: (uniqueId: string) => void;
  handleDeposit: (amount: string) => Promise<boolean>;
}

export const useCryptoPayment = (selectedMethod: WithdrawMethod): UseCryptoPaymentReturn => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('walletModal');

  const depositData = useSelector(selectDepositData);

  const { data: depositMethods, isLoading } = useGetWalletDepositMethodsQuery();
  const [deposit, { isLoading: isDepositLoading }] = useDepositMutation();

  // Извлекаем данные из ответа API
  const address = depositData?.requisites?.address || '';
  const botPayUrl = depositData?.requisites?.bot_pay_url || '';
  const miniAppUrl = depositData?.requisites?.mini_app_url || '';

  let network: string = '';

  if ('network' in selectedMethod) {
    network = selectedMethod.network || '';
  }
  const minAmount = String(selectedMethod.min || 0);
  const amountIcon = selectedMethod.currency.icon?.url || '';
  const cryptoCode = selectedMethod.currency.code;

  // Формирование списка телеграм криптовалют
  const telegramCryptoItems = useMemo((): DropdownMenuItems[] => {
    if (!depositMethods?.telegram) return [];

    return depositMethods.telegram.flatMap(telegramMethod =>
      telegramMethod.assets.map(asset =>
        createMenuItem(asset.code, asset.network, asset.title, asset?.currency?.icon?.url),
      ),
    );
  }, [depositMethods]);

  // Обработчик изменения метода
  const handleMethodChange = useCallback(
    (uniqueId: string) => {
      let method = null;

      if (depositMethods?.telegram) {
        for (const telegramMethod of depositMethods.telegram) {
          const asset = telegramMethod.assets.find(a => `${a.code}-${a.network}` === uniqueId);

          if (asset) {
            method = asset;
            break;
          }
        }
      }

      if (method) {
        dispatch(setSelectedWithdrawMethod({ method }));
      } else {
        console.warn('Method not found for id:', uniqueId);
      }
    },
    [depositMethods, dispatch],
  );

  // Обработчик создания депозита
  const handleDeposit = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!isValidAmount(amount, minAmount)) {
        console.warn('Invalid amount:', { amount, minAmount });

        return false;
      }

      if (!selectedMethod || !depositMethods) {
        console.warn('Missing required data for deposit:', { selectedMethod, depositMethods });

        return false;
      }

      try {
        const depositParams = getDepositParams(selectedMethod, depositMethods, amount);
        const result = await deposit(depositParams).unwrap();

        dispatch(setDepositData({ data: result }));

        return true;
      } catch (error) {
        console.error('Failed to create deposit:', error);

        return false;
      }
    },
    [selectedMethod, depositMethods, minAmount, deposit, dispatch],
  );

  // Метка минимальной суммы
  const minAmountLabel = useMemo(() => {
    const currencyCode = selectedMethod?.currency?.code || '';
    const minAmount = selectedMethod?.min || '0';

    return t('withdrawal.minAmount', { amount: minAmount, currency: currencyCode });
  }, [selectedMethod, t]);

  // ID выбранного метода
  const selectedMethodId =
    selectedMethod && hasNetwork(selectedMethod)
      ? `${selectedMethod.code}-${selectedMethod.network}`
      : selectedMethod?.code;

  // Автоматически выбираем первый метод, если ничего не выбрано
  useEffect(() => {
    if (!selectedMethod && telegramCryptoItems.length > 0 && !isLoading) {
      const firstMethodId = telegramCryptoItems[0].id;

      handleMethodChange(firstMethodId);
    }
  }, [selectedMethod, telegramCryptoItems, isLoading, handleMethodChange]);

  // Сбрасываем данные депозита при смене метода
  useEffect(() => {
    if (selectedMethod) {
      dispatch(setDepositData({ data: null }));
    }
  }, [selectedMethodId, selectedMethod, dispatch]);

  return {
    // Data
    selectedMethod,
    telegramCryptoItems,
    address,
    network,
    minAmount,
    amountIcon,
    cryptoCode,
    botPayUrl,
    miniAppUrl,
    minAmountLabel,
    selectedMethodId,
    depositData,

    // Loading states
    isLoading,
    isDepositLoading,

    // Handlers
    handleMethodChange,
    handleDeposit,
  };
};
