import { FC, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
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
  const method = selectedMethod.code;
  const dispatch = useDispatch();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const { data: geoCountry } = useUserGeoCountry();
  const minAmount = useMemo(() => getMinAmount(selectedMethod), [selectedMethod]);
  const { data: balanceData } = useGetUserBalanceQuery();
  const [checkEligibility, { data: eligibilityData }] = useLazyGetWalletWithdrawEligibilityQuery();

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Refs для прокрутки к полям с ошибками (для BankSelector)
  const bankRef = useRef<HTMLDivElement | null>(null);

  // Ref для хранения актуальных значений валидации
  const validationRef = useRef({ minAmount, geoCountry });

  validationRef.current = { minAmount, geoCountry };

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
                ? 'Это поле обязательно для заполнения'
                : 'Проверьте правильность заполнения поля',
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

        toast.error('Невозможно вывести средства', 'Проверьте данные и попробуйте еще раз');

        return;
      }

      await withdraw({
        method,
        amount: data.amount,
        asset_code: null,
        fields,
      }).unwrap();

      toast.success('Заявка на вывод создана', 'Средства будут переведены в ближайшее время');

      dispatch(resetModal());
    } catch (error) {
      console.error('Ошибка при выводе средств:', error);
      toast.error('Ошибка при выводе средств', 'Попробуйте еще раз или обратитесь в поддержку');
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
                  return 'Выберите банк';
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
                return 'Введите ФИО';
              }

              return true;
            },
          }}
          render={({ field }) => (
            <Input label="ФИО" isGhost error={hasAttemptedSubmit && !!errors.fullName} {...field} maxLength={25} />
          )}
        />
        {hasAttemptedSubmit && errors.fullName && <p className={styles.errorMessage}>{errors.fullName.message}</p>}

        <Controller
          name="card"
          control={control}
          rules={{
            validate: (value: string) => {
              if (!value || value.trim() === '') {
                return 'Введите номер карты';
              }

              const cleanValue = value.replace(/\s/g, '');

              if (cleanValue.length > MAX_CARD_NUMBER_LENGTH) {
                return 'Некорректный номер карты';
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
                label="Номер карты"
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
              const { minAmount: currentMinAmount } = validationRef.current;

              if (!value || value.trim() === '') {
                return 'Введите сумму';
              }

              const num = Number.parseFloat(value);

              if (Number.isNaN(num) || num < currentMinAmount) {
                return `Минимальная сумма ${currentMinAmount.toLocaleString('ru-RU')} ₽`;
              }

              return true;
            },
          }}
          render={({ field }) => {
            const displayValue = field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';

            return (
              <Input
                ref={field.ref}
                label={`Минимальная сумма ${minAmount.toLocaleString('ru-RU')} ₽`}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.amount}
                value={displayValue}
                maxLength={MAX_INPUT_LENGTH}
                onChange={e => {
                  const cleanValue = e.target.value.replace(/[^\d]/g, '');

                  field.onChange(cleanValue);
                }}
                onBlur={field.onBlur}
              />
            );
          }}
        />
        {hasAttemptedSubmit && errors.amount && <p className={styles.errorMessage}>{errors.amount.message}</p>}

        <p className={styles.currentBalance}>Ваш текущий баланс: {currentBalance}</p>

        <div className={styles.currentAccount}>
          <p className={styles.text}>На счет поступит:</p>
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
          Продолжить
        </Button>
      </form>
    </div>
  );
};
