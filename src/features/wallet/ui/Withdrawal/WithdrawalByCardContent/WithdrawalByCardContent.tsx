import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useDebounce, getCurrencySymbol, formatBalance } from '@shared/lib';
import { Button, Input, toast } from '@shared/ui';

import styles from './WithdrawalByCardContent.module.scss';

import { useGetUserBalanceQuery } from '@/entities/user';
import { useUserGeoCountry } from '@/entities/user/api/userApi';
import { useLazyGetWalletWithdrawEligibilityQuery, useWithdrawMutation } from '@/features/wallet/api/walletApi';
import { getMinAmount, parseAmount } from '@/features/wallet/lib/utils';
import type { WithdrawMethod } from '@/features/wallet/model';
import { resetModal } from '@/features/wallet/model';
import { BankSelector } from '@features/wallet/ui/components/BankSelector';

const MAX_CARD_NUMBER_LENGTH = 20;
const MAX_INPUT_LENGTH = 16;
const ELIGIBILITY_CHECK_DEBOUNCE_MS = 500;
const FOCUS_DELAY_MS = 100;
const PRECISION_NUMBER = 2;

interface WithdrawalByCardContentProps {
  selectedMethod: WithdrawMethod;
}

interface WithdrawalFormValues {
  bank: string;
  fullName: string;
  card: string;
  amount: string;
}

export const WithdrawalByCardContent: FC<WithdrawalByCardContentProps> = ({ selectedMethod }) => {
  const { t } = useTranslation('walletModal');
  const method = selectedMethod.code;
  const dispatch = useDispatch();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const { data: geoCountry } = useUserGeoCountry();
  const minAmount = useMemo(() => getMinAmount(selectedMethod), [selectedMethod]);
  const { data: balanceData } = useGetUserBalanceQuery();
  const [checkEligibility, { data: eligibilityData }] = useLazyGetWalletWithdrawEligibilityQuery();
  const currencySymbol = getCurrencySymbol(selectedMethod.currency);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Refs для прокрутки к полям с ошибками (для BankSelector)
  const bankRef = useRef<HTMLDivElement | null>(null);

  // Ref для хранения актуальных значений валидации
  const validationRef = useRef({ minAmount, geoCountry, currencySymbol });
  const prevRawLengthRef = useRef<number>(0);

  validationRef.current = { minAmount, geoCountry, currencySymbol };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    setFocus,
    trigger,
    setError,
  } = useForm<WithdrawalFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      bank: '',
      fullName: '',
      card: '',
      amount: '',
    },
  });

  const formValues = watch();
  const debouncedFormValues = useDebounce(formValues, ELIGIBILITY_CHECK_DEBOUNCE_MS);

  // Преобразуем сумму в число для BankSelector
  const amountForBankSelector = useMemo(() => {
    const num = parseAmount(formValues.amount);

    return !Number.isNaN(num) && num >= minAmount ? num : minAmount;
  }, [formValues.amount, minAmount]);

  // Проверка готовности формы к проверке eligibility
  const isReadyForEligibilityCheck = useMemo(() => {
    const numAmount = parseAmount(debouncedFormValues.amount);

    return !!(
      debouncedFormValues.bank &&
      debouncedFormValues.amount &&
      debouncedFormValues.fullName &&
      debouncedFormValues.card &&
      isValid &&
      !Number.isNaN(numAmount) &&
      numAmount >= minAmount
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormValues, minAmount]);

  // Параметры запроса для eligibility check
  const requestParams = useMemo(() => {
    if (!isReadyForEligibilityCheck || !method) {
      return null;
    }

    const numAmount = parseAmount(debouncedFormValues.amount);

    if (Number.isNaN(numAmount) || numAmount < minAmount) {
      return null;
    }

    const fields = {
      card: debouncedFormValues.card.replace(/\s/g, ''),
      bank: debouncedFormValues.bank,
      full_name: debouncedFormValues.fullName,
    };

    return {
      method,
      amount: debouncedFormValues.amount,
      fields: JSON.stringify(fields),
    };
  }, [debouncedFormValues, method, minAmount, isReadyForEligibilityCheck]);

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

  const withdrawableAmount: string = useMemo(() => {
    const precision = eligibilityData?.withdrawable_currency?.precision || PRECISION_NUMBER;

    if (eligibilityData?.withdrawable != null) {
      // Преобразуем в число перед вызовом toFixed
      const withdrawableNumber = Number(eligibilityData.withdrawable);

      if (withdrawableNumber === 0) {
        return '0';
      }
      if (!isNaN(withdrawableNumber)) {
        // Проверяем, что получилось валидное число
        return withdrawableNumber.toFixed(precision);
      }
    }

    return '0';
  }, [eligibilityData?.withdrawable, eligibilityData?.withdrawable_currency?.precision]);

  const withdrawableCurrency = useMemo(() => {
    if (eligibilityData?.withdrawable_currency) {
      return getCurrencySymbol(eligibilityData.withdrawable_currency);
    }

    return getCurrencySymbol(selectedMethod.currency);
  }, [eligibilityData?.withdrawable_currency, selectedMethod.currency]);

  const currentBalance = useMemo(() => {
    const balanceNumber = Number(balanceData?.balance ?? 0);
    const formattedValue = Number.isNaN(balanceNumber) ? 0 : balanceNumber;
    const currencySymbol = getCurrencySymbol(balanceData?.currency);

    return `${formatBalance(formattedValue)} ${currencySymbol}`;
  }, [balanceData?.balance, balanceData?.currency]);

  // Обновляем значения формы при изменении метода
  useEffect(() => {
    setValue('bank', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setValue('fullName', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setValue('card', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setValue('amount', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setHasAttemptedSubmit(false);
  }, [selectedMethod.code, setValue]);

  const transformFields = (
    values: WithdrawalFormValues,
  ): {
    bank: string;
    full_name: string;
    card: string;
  } => {
    return {
      bank: values.bank,
      full_name: values.fullName,
      card: values.card,
    };
  };

  const onSubmit = async (data: WithdrawalFormValues): Promise<void> => {
    try {
      const fields = transformFields(data);

      // Проверяем eligibility перед отправкой запроса
      const eligibilityParams = {
        method,
        amount: data.amount,
        asset_code: undefined,
        fields: JSON.stringify(fields),
      };

      const eligibilityResult = await checkEligibility(eligibilityParams).unwrap();

      // Если eligibility не пройдена, показываем ошибку и не отправляем запрос
      if (!eligibilityResult.eligible) {
        // Маппинг полей из API на поля формы
        const fieldMapping: Record<string, keyof WithdrawalFormValues> = {
          bank: 'bank',
          full_name: 'fullName',
          card: 'card',
          amount: 'amount',
        };

        // Устанавливаем ошибки для полей с ошибками
        const errorFields = [...(eligibilityResult.invalid_fields || []), ...(eligibilityResult.missing_fields || [])];

        errorFields.forEach(fieldName => {
          const formFieldName = fieldMapping[fieldName];

          if (formFieldName) {
            setError(formFieldName, {
              type: 'server',
              message: eligibilityResult.missing_fields?.includes(fieldName)
                ? t('withdrawalByCard.errors.requiredField')
                : t('withdrawalByCard.errors.invalidField'),
            });
          }
        });

        // Устанавливаем флаг попытки отправки для отображения ошибок
        setHasAttemptedSubmit(true);

        // Фокусируем первое поле с ошибкой
        const firstErrorField = errorFields[0];

        if (firstErrorField) {
          const formFieldName = fieldMapping[firstErrorField];

          if (formFieldName) {
            requestAnimationFrame(() => {
              if (formFieldName === 'bank') {
                bankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              } else {
                setTimeout(() => {
                  setFocus(formFieldName);
                }, FOCUS_DELAY_MS);
              }
            });
          }
        }

        toast.error(t('withdrawalByCard.errors.withdrawalNotPossible'), t('withdrawalByCard.errors.checkData'));

        return;
      }

      await withdraw({
        method,
        amount: data.amount,
        asset_code: null,
        fields,
      }).unwrap();

      toast.success(t('withdrawalByCard.success.title'), t('withdrawalByCard.success.description'));

      dispatch(resetModal());
    } catch (error) {
      console.error('Ошибка при выводе средств:', error);
      toast.error(t('withdrawalByCard.errors.withdrawalError'), t('withdrawalByCard.errors.contactSupport'));
    }
  };

  const handleContinue = async (): Promise<void> => {
    setHasAttemptedSubmit(true);

    // Валидируем все поля по порядку, чтобы найти первое с ошибкой
    const fieldOrder: (keyof WithdrawalFormValues)[] = ['bank', 'fullName', 'card', 'amount'];

    let firstErrorField: keyof WithdrawalFormValues | null = null;

    // Валидируем все поля, но запоминаем первое с ошибкой
    for (const fieldName of fieldOrder) {
      const fieldValid = await trigger(fieldName);

      if (!fieldValid && !firstErrorField) {
        firstErrorField = fieldName;
      }
    }

    // Если есть ошибки, фокусируем первое поле с ошибкой
    if (firstErrorField) {
      // Используем requestAnimationFrame для гарантии обновления DOM после валидации
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (firstErrorField === 'bank') {
            bankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            // Для остальных полей (fullName, cardNumber, amount)
            // Используем setFocus с небольшой задержкой для гарантии обновления DOM
            setTimeout(() => {
              setFocus(firstErrorField!);
            }, FOCUS_DELAY_MS);
          }
        });
      });

      return;
    }

    // Все поля валидны, отправляем форму
    void handleSubmit(async data => {
      await onSubmit(data);
    })();
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        <div ref={bankRef}>
          <Controller
            name="bank"
            control={control}
            rules={{
              validate: (value: string) => {
                if (!value || value.trim() === '') {
                  return t('withdrawalByCard.validation.selectBank');
                }

                return true;
              },
            }}
            render={({ field }) => (
              <BankSelector
                method={method}
                amount={amountForBankSelector}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {hasAttemptedSubmit && errors.bank && <p className={styles.errorMessage}>{errors.bank.message}</p>}
        </div>

        <Controller
          name="fullName"
          control={control}
          rules={{
            validate: (value: string) => {
              if (!value || value.trim() === '') {
                return t('withdrawalByCard.validation.enterFullName');
              }

              return true;
            },
          }}
          render={({ field }) => (
            <Input
              label={t('withdrawalByCard.labels.fullName')}
              isGhost
              error={hasAttemptedSubmit && !!errors.fullName}
              {...field}
              maxLength={25}
            />
          )}
        />
        {hasAttemptedSubmit && errors.fullName && <p className={styles.errorMessage}>{errors.fullName.message}</p>}

        <Controller
          name="card"
          control={control}
          rules={{
            validate: (value: string) => {
              if (!value || value.trim() === '') {
                return t('withdrawalByCard.validation.enterCardNumber');
              }

              const cleanValue = value.replace(/\s/g, '');

              if (cleanValue.length > MAX_CARD_NUMBER_LENGTH) {
                return t('withdrawalByCard.validation.invalidCardNumber');
              }

              return true;
            },
          }}
          render={({ field }) => {
            const displayValue = field.value
              ? field.value
                  .replace(/\s/g, '')
                  .replace(/(\d{4})/g, '$1 ')
                  .trim()
              : '';

            return (
              <Input
                ref={field.ref}
                label={t('withdrawalByCard.labels.cardNumber')}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.card}
                value={displayValue}
                maxLength={MAX_CARD_NUMBER_LENGTH}
                onChange={e => {
                  const cleanValue = e.target.value.replace(/[^\d]/g, '');

                  field.onChange(cleanValue);
                }}
                onBlur={field.onBlur}
              />
            );
          }}
        />
        {hasAttemptedSubmit && errors.card && <p className={styles.errorMessage}>{errors.card.message}</p>}

        <Controller
          name="amount"
          control={control}
          rules={{
            validate: (value: string) => {
              const { minAmount: currentMinAmount, currencySymbol } = validationRef.current;

              if (!value || value.trim() === '') {
                return t('withdrawalByCard.validation.enterAmount');
              }

              // Заменяем запятую на точку для парсинга
              const normalizedValue = value.replace(',', '.');
              const num = Number(normalizedValue);

              if (Number.isNaN(num) || num < currentMinAmount) {
                return t('withdrawalByCard.validation.minAmount', {
                  amount: currentMinAmount.toLocaleString('ru-RU'),
                  currency: currencySymbol,
                });
              }

              return true;
            },
          }}
          render={({ field }) => {
            const handleAmountChange = (event: ChangeEvent<HTMLInputElement>): void => {
              const rawValue = event.target.value;

              // Заменяем запятую на точку
              const valueWithDot = rawValue.replace(',', '.');

              // Разрешаем только цифры и одну точку
              // Удаляем все символы кроме цифр и точки
              let formattedValue = valueWithDot.replace(/[^\d.]/g, '');

              // Разрешаем только одну точку
              const parts = formattedValue.split('.');

              if (parts.length > PRECISION_NUMBER) {
                formattedValue = parts[0] + '.' + parts.slice(1).join('');
              }

              // Если поле полностью очищено
              if (formattedValue === '' || formattedValue === '.') {
                field.onChange('');
                prevRawLengthRef.current = 0;

                return;
              }

              // Убираем ведущие нули из целой части, если число больше 1
              if (parts[0].length > 1) {
                parts[0] = parts[0].replace(/^0+/, '') || '0';
                formattedValue = parts.length === PRECISION_NUMBER ? parts[0] + '.' + parts[1] : parts[0];
              }

              // Если целая часть начинается с 0 и есть десятичная часть
              if (parts[0] === '0' && parts.length === PRECISION_NUMBER) {
                formattedValue = '0.' + parts[1];
              }

              // Ограничиваем количество знаков после запятой (например, до 2)
              if (parts.length === PRECISION_NUMBER && parts[1].length > PRECISION_NUMBER) {
                formattedValue = parts[0] + '.' + parts[1].slice(0, PRECISION_NUMBER);
              }

              // Ограничиваем общую длину
              if (formattedValue.length > MAX_INPUT_LENGTH) {
                formattedValue = formattedValue.slice(0, MAX_INPUT_LENGTH);
              }

              field.onChange(formattedValue);
              prevRawLengthRef.current = formattedValue.length;
            };

            return (
              <Input
                ref={field.ref}
                label={t('withdrawalByCard.labels.minAmount', {
                  amount: minAmount.toLocaleString('ru-RU'),
                  currency: '₽',
                })}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.amount}
                value={formValues.amount}
                maxLength={MAX_INPUT_LENGTH}
                onChange={handleAmountChange}
                onBlur={field.onBlur}
              />
            );
          }}
        />
        {hasAttemptedSubmit && errors.amount && <p className={styles.errorMessage}>{errors.amount.message}</p>}

        <p className={styles.currentBalance}>
          {t('withdrawalByCard.currentBalance')} {currentBalance}
        </p>

        <div className={styles.currentAccount}>
          <p className={styles.text}>{t('withdrawalByCard.willBeCredited')}</p>
          <p className={styles.value}>
            {withdrawableAmount} {withdrawableCurrency}
          </p>
        </div>

        <Button
          variant="primary"
          fullWidth={true}
          disabled={isWithdrawing}
          onClick={handleContinue}
          icon={isWithdrawing ? <div className={styles.spinner} /> : undefined}
          className={clsx(isWithdrawing && styles.loadingButton)}
        >
          {isWithdrawing ? t('withdrawalByCard.buttons.processing') : t('withdrawalByCard.buttons.continue')}
        </Button>
      </form>
    </div>
  );
};
