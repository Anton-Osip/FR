import { useMemo, useEffect, useCallback, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { useDebounce, getCurrencySymbol, formatBalance } from '@shared/lib';

import { useLazyGetWalletWithdrawEligibilityQuery } from '../api/walletApi';
import { getMinAmount, parseAmount } from '../lib/utils';
import type { WithdrawMethod } from '../model';

import { useGetUserBalanceQuery } from '@entities/user';

const ELIGIBILITY_CHECK_DEBOUNCE_MS = 500;

export interface WithdrawalFormConfig<T extends FieldValues> {
  /** Функция для создания схемы валидации формы с учетом minAmount */
  createSchema: (minAmount: number) => z.ZodSchema<T>;
  /** Значения по умолчанию для формы */
  defaultValues: T;
  /** Функция для преобразования значений формы в поля для API */
  transformFields: (values: T) => Record<string, string>;
  /** Функция для проверки готовности формы к проверке eligibility */
  isReadyForEligibilityCheck: (values: T, isValid: boolean, minAmount: number) => boolean;
}

export interface UseWithdrawalFormReturn<T extends FieldValues> {
  /** Объект формы из react-hook-form */
  form: UseFormReturn<T>;
  /** Данные eligibility */
  eligibilityData: ReturnType<typeof useLazyGetWalletWithdrawEligibilityQuery>[1]['data'];
  /** Флаг загрузки проверки eligibility */
  isCheckingEligibility: boolean;
  /** Минимальная сумма вывода */
  minAmount: number;
  /** Текущий баланс пользователя */
  currentBalance: string;
  /** Сумма, которая поступит на счет */
  withdrawableAmount: string;
  /** Валюта суммы, которая поступит на счет */
  withdrawableCurrency: string;
  /** Флаг, что форма валидна и можно выводить */
  isFormValid: boolean;
  /** Сумма для BankSelector (число) */
  amountForBankSelector: number;
}

/**
 * Хук для управления формой вывода средств
 * @param selectedMethod - Выбранный метод вывода
 * @param config - Конфигурация формы
 */
export const useWithdrawalForm = <T extends FieldValues>(
  selectedMethod: WithdrawMethod,
  config: WithdrawalFormConfig<T>,
): UseWithdrawalFormReturn<T> => {
  const method = selectedMethod.code;
  const minAmount = useMemo(() => getMinAmount(selectedMethod), [selectedMethod]);
  const { data: balanceData } = useGetUserBalanceQuery();
  const [checkEligibility, { data: eligibilityData, isLoading: isCheckingEligibility }] =
    useLazyGetWalletWithdrawEligibilityQuery();

  // config мемоизирован в компонентах, поэтому используем только функции из него
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => config.createSchema(minAmount), [config.createSchema, minAmount]);

  // Используем явное приведение типов для совместимости с react-hook-form

  const form = useForm<T>({
    mode: 'onTouched',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: config.defaultValues as any,
  }) as UseFormReturn<T>;

  const { watch, formState } = form;
  const { isValid } = formState;

  // Получаем все значения формы
  const formValues = watch() as T;

  // Debounce всего объекта значений формы
  const debouncedFormValues = useDebounce(formValues, ELIGIBILITY_CHECK_DEBOUNCE_MS);

  // Преобразуем сумму в число для BankSelector
  const amountForBankSelector = useMemo(() => {
    const amountValue = (formValues as Record<string, unknown>).amount;
    const num = parseAmount(amountValue);

    return !Number.isNaN(num) && num >= minAmount ? num : minAmount;
  }, [formValues, minAmount]);

  // Мемоизируем функции из config для стабильности зависимостей
  // config мемоизирован в компонентах, поэтому используем только функции из него

  const isReadyForEligibilityCheck = useCallback(
    (values: T, isValidValue: boolean, minAmountValue: number) =>
      config.isReadyForEligibilityCheck(values, isValidValue, minAmountValue),
    [config],
  );

  const transformFields = useCallback(
    (values: T) => config.transformFields(values),
    // config мемоизирован в компонентах, поэтому используем только функции из него
    [config],
  );

  // Мемоизируем параметры запроса для сравнения
  const requestParams = useMemo(() => {
    if (!isReadyForEligibilityCheck(debouncedFormValues as T, isValid, minAmount) || !method) {
      return null;
    }

    const amountValue = (debouncedFormValues as Record<string, unknown>).amount;
    const numAmount = parseAmount(amountValue);

    if (Number.isNaN(numAmount) || numAmount < minAmount) {
      return null;
    }

    const amountStr = typeof amountValue === 'string' ? amountValue : String(amountValue ?? '');
    const fields = transformFields(debouncedFormValues as T);
    const fieldsString = JSON.stringify(fields);

    return {
      method,
      amount: amountStr,
      fields: fieldsString,
    };
  }, [debouncedFormValues, isValid, method, minAmount, isReadyForEligibilityCheck, transformFields]);

  // Храним предыдущие параметры запроса для предотвращения повторных вызовов
  const prevRequestParamsRef = useRef<string | null>(null);

  // Проверяем eligibility при изменении формы с debounce
  useEffect(() => {
    if (!requestParams) {
      prevRequestParamsRef.current = null;

      return;
    }

    // Создаем строку для сравнения параметров
    const requestKey = `${requestParams.method}|${requestParams.amount}|${requestParams.fields}`;

    // Проверяем, изменились ли параметры
    if (prevRequestParamsRef.current === requestKey) {
      return;
    }

    // Обновляем предыдущие параметры и отправляем запрос
    prevRequestParamsRef.current = requestKey;
    checkEligibility(requestParams);
  }, [requestParams, checkEligibility]);

  const withdrawableAmount = useMemo(() => {
    if (eligibilityData?.withdrawable != null) {
      return eligibilityData.withdrawable.toLocaleString('ru-RU');
    }

    return '0';
  }, [eligibilityData?.withdrawable]);

  const withdrawableCurrency = useMemo(() => {
    if (eligibilityData?.withdrawable_currency) {
      return getCurrencySymbol(eligibilityData.withdrawable_currency);
    }

    return getCurrencySymbol(selectedMethod.currency);
  }, [eligibilityData?.withdrawable_currency, selectedMethod.currency]);

  const isEligible = eligibilityData?.eligible ?? false;
  const isFormValid = isValid && isEligible && !isCheckingEligibility;

  const currentBalance = useMemo(() => {
    const balanceNumber = Number(balanceData?.balance ?? 0);
    const formattedValue = Number.isNaN(balanceNumber) ? 0 : balanceNumber;
    const currencySymbol = getCurrencySymbol(balanceData?.currency);

    return `${formatBalance(formattedValue)} ${currencySymbol}`;
  }, [balanceData?.balance, balanceData?.currency]);

  return {
    form,
    eligibilityData,
    isCheckingEligibility,
    minAmount,
    currentBalance,
    withdrawableAmount,
    withdrawableCurrency,
    isFormValid,
    amountForBankSelector,
  };
};
