import { type ElementType, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useAppDispatch } from '@shared/api';
import { useDebounce, getCurrencySymbol, formatBalance } from '@shared/lib';
import { Button, Input, toast } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp';

import styles from './WithdrawalByCryptocurrencyContent.module.scss';

import { useGetUserBalanceQuery } from '@/entities/user';
import {
  useGetWalletWithdrawMethodsQuery,
  useLazyGetWalletWithdrawEligibilityQuery,
  useWithdrawMutation,
} from '@features/wallet/api/walletApi';
import { getMinAmount, parseAmount } from '@features/wallet/lib/utils';
import { resetModal, setSelectedWithdrawMethod, type WithdrawMethod } from '@features/wallet/model';
import type { CryptoWithdrawMethod, TelegramWithdrawAsset } from '@features/wallet/model/apiTypes';
import { DropdownWallet } from '@features/wallet/ui/components/DropdownWallet';
import { WithdrawalEligibilityErrors } from '@features/wallet/ui/components/WithdrawalEligibilityErrors';

const ELIGIBILITY_CHECK_DEBOUNCE_MS = 500;
const FOCUS_DELAY_MS = 100;
const MIN_CRYPTO_ADDRESS_LENGTH = 26;
const MAX_CRYPTO_ADDRESS_LENGTH = 100;
const PRECISION_NUMBER = 2;

interface Props {
  selectedMethod: WithdrawMethod;
}

interface WithdrawalFormValues {
  walletAddress: string;
  memo?: string;
  amount: string;
}

// Компонент для отображения иконки криптовалюты из URL
const CryptoIcon: FC<{ url: string; alt: string; className?: string }> = ({ url, alt, className }) => {
  return <img src={url} alt={alt} className={className} />;
};

// Вспомогательная функция для создания элемента меню
const createMenuItem = (
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

export const WithdrawalByCryptocurrencyContent: FC<Props> = ({ selectedMethod }) => {
  const { t } = useTranslation('walletModal');
  const appDispatch = useAppDispatch();
  const dispatch = useDispatch();
  const { data: withdrawMethods, isLoading } = useGetWalletWithdrawMethodsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const { data: balanceData } = useGetUserBalanceQuery();
  const [checkEligibility, { data: eligibilityData }] = useLazyGetWalletWithdrawEligibilityQuery();

  const minAmount = useMemo(() => getMinAmount(selectedMethod), [selectedMethod]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Ref для хранения актуальных значений валидации
  const validationRef = useRef({ minAmount, selectedMethod });

  validationRef.current = { minAmount, selectedMethod };

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
      walletAddress: '',
      memo: '',
      amount: '',
    },
  });

  const formValues = watch();
  const debouncedFormValues = useDebounce(formValues, ELIGIBILITY_CHECK_DEBOUNCE_MS);

  // Проверка готовности формы к проверке eligibility
  const isReadyForEligibilityCheck = useMemo(() => {
    const numAmount = parseAmount(debouncedFormValues.amount);

    return !!(
      debouncedFormValues.walletAddress &&
      debouncedFormValues.amount &&
      isValid &&
      !Number.isNaN(numAmount) &&
      numAmount >= minAmount
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormValues, minAmount]);

  // Определяем method и asset_code для запроса
  const getMethodParams = useCallback(() => {
    const isCryptoMethod = withdrawMethods?.crypto?.some(
      m =>
        m.code === selectedMethod.code &&
        'network' in selectedMethod &&
        'network' in m &&
        m.network === selectedMethod.network,
    );

    let method: string;
    let asset_code: string | null;

    if (isCryptoMethod) {
      // Для crypto: method = code, asset_code = network
      method = selectedMethod.code;
      asset_code = 'network' in selectedMethod ? selectedMethod.network : null;
    } else {
      // Для telegram: ищем родительский telegram метод
      let telegramMethodCode: string | null = null;

      if ('network' in selectedMethod && withdrawMethods?.telegram) {
        for (const telegramMethod of withdrawMethods.telegram) {
          const asset = telegramMethod.assets.find(
            a => a.code === selectedMethod.code && a.network === selectedMethod.network,
          );

          if (asset) {
            telegramMethodCode = telegramMethod.code;
            break;
          }
        }
      }

      method = telegramMethodCode || selectedMethod.code;
      asset_code = 'network' in selectedMethod ? selectedMethod.code : null;
    }

    return { method, asset_code };
  }, [withdrawMethods, selectedMethod]);

  // Параметры запроса для eligibility check
  const requestParams = useMemo(() => {
    if (!isReadyForEligibilityCheck) {
      return null;
    }

    const numAmount = parseAmount(debouncedFormValues.amount);

    if (Number.isNaN(numAmount) || numAmount < minAmount) {
      return null;
    }

    const { method } = getMethodParams();

    const fields: Record<string, string> = {
      address: debouncedFormValues.walletAddress,
    };

    if (debouncedFormValues.memo !== '') {
      fields.memo = debouncedFormValues.memo || '';
    }

    return {
      method,
      amount: debouncedFormValues.amount,
      asset_code: getMethodParams().asset_code || undefined,
      fields: JSON.stringify(fields),
    };
  }, [debouncedFormValues, minAmount, isReadyForEligibilityCheck, getMethodParams]);

  // Храним предыдущие параметры запроса для предотвращения повторных вызовов
  const prevRequestParamsRef = useRef<string | null>(null);

  // Проверяем eligibility при изменении формы с debounce
  useEffect(() => {
    if (!requestParams) {
      prevRequestParamsRef.current = null;

      return;
    }

    // Создаем строку для сравнения параметров
    const requestKey = `${requestParams.method}|${requestParams.amount}|${requestParams.asset_code || ''}|${requestParams.fields}`;

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
    setValue('walletAddress', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setValue('memo', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setValue('amount', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    setHasAttemptedSubmit(false);
  }, [selectedMethod.code, setValue]);

  const allCryptoItems = useMemo((): DropdownMenuItems[] => {
    const items: DropdownMenuItems[] = [];

    // Добавляем crypto методы
    if (withdrawMethods?.crypto) {
      const cryptoItems = withdrawMethods.crypto.map(method =>
        createMenuItem(method.code, method.network, method.title, method?.currency?.icon?.url),
      );

      items.push(...cryptoItems);
    }

    return items;
  }, [withdrawMethods]);

  const handleMethodChange = useCallback(
    (uniqueId: string) => {
      // Ищем в crypto методах
      let method = withdrawMethods?.crypto?.find(m => `${m.code}-${m.network}` === uniqueId);

      // Если не нашли, ищем в telegram assets
      if (!method && withdrawMethods?.telegram) {
        for (const telegramMethod of withdrawMethods.telegram) {
          const asset = telegramMethod.assets.find(a => `${a.code}-${a.network}` === uniqueId);

          if (asset) {
            method = asset;
            break;
          }
        }
      }

      if (method) {
        appDispatch(setSelectedWithdrawMethod({ method }));
      }
    },
    [withdrawMethods, appDispatch],
  );

  const transformFields = (values: WithdrawalFormValues): { address: string; memo: string } | { address: string } => {
    if (values.memo === '') {
      return {
        address: values.walletAddress,
      };
    } else {
      return {
        address: values.walletAddress,
        memo: values.memo || '',
      };
    }
  };

  const onSubmit = async (data: WithdrawalFormValues): Promise<void> => {
    try {
      const fields = transformFields(data);
      const { method, asset_code } = getMethodParams();

      // Проверяем eligibility перед отправкой запроса
      const eligibilityParams = {
        method,
        amount: data.amount,
        asset_code: asset_code || undefined,
        fields: JSON.stringify(fields),
      };

      const eligibilityResult = await checkEligibility(eligibilityParams).unwrap();

      // Если eligibility не пройдена, показываем ошибку и не отправляем запрос
      if (!eligibilityResult.eligible) {
        // Маппинг полей из API на поля формы
        const fieldMapping: Record<string, keyof WithdrawalFormValues> = {
          address: 'walletAddress',
          memo: 'memo',
          amount: 'amount',
        };

        // Устанавливаем ошибки для полей с ошибками
        const errorFields = [...(eligibilityResult.invalid_fields || []), ...(eligibilityResult.missing_fields || [])];

        errorFields.forEach(fieldName => {
          const formFieldName = fieldMapping[fieldName];

          if (formFieldName) {
            const isMissing = eligibilityResult.missing_fields?.includes(fieldName);
            const errorMessage = isMissing
              ? 'Это поле обязательно для заполнения'
              : 'Проверьте правильность заполнения поля';

            setError(formFieldName, {
              type: 'server',
              message: errorMessage,
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
              setTimeout(() => {
                setFocus(formFieldName);
              }, FOCUS_DELAY_MS);
            });
          }
        }

        toast.error('Невозможно вывести средства', 'Проверьте данные и попробуйте еще раз');

        return;
      }

      await withdraw({
        method,
        amount: data.amount,
        asset_code,
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
    const fieldOrder: (keyof WithdrawalFormValues)[] = ['walletAddress', 'amount'];

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
          // Используем setFocus с небольшой задержкой для гарантии обновления DOM
          setTimeout(() => {
            setFocus(firstErrorField!);
          }, FOCUS_DELAY_MS);
        });
      });

      return;
    }

    // Все поля валидны, отправляем форму
    void handleSubmit(async data => {
      await onSubmit(data);
    })();
  };

  const minAmountLabel = useMemo(() => {
    const currencyCode = selectedMethod.currency?.code || '';

    return t('withdrawal.minAmount', { amount: minAmount, currency: currencyCode });
  }, [selectedMethod.currency?.code, minAmount, t]);

  if (isLoading) {
    return <div className={styles.container}>{t('withdrawal.loading')}</div>;
  }

  if (!allCryptoItems.length) {
    return <div className={styles.container}>{t('withdrawal.noMethods')}</div>;
  }

  const isCryptoOrTelegramMethod = (method: WithdrawMethod): method is CryptoWithdrawMethod | TelegramWithdrawAsset => {
    return 'network' in method;
  };

  const selectedMethodId = isCryptoOrTelegramMethod(selectedMethod)
    ? `${selectedMethod.code}-${selectedMethod.network}`
    : selectedMethod.code;

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        <DropdownWallet items={allCryptoItems} value={selectedMethodId} onChange={handleMethodChange} />

        <Controller
          name="walletAddress"
          control={control}
          rules={{
            validate: (value: string) => {
              if (!value || value.trim() === '') {
                return 'Введите адрес кошелька';
              }

              if (value.length < MIN_CRYPTO_ADDRESS_LENGTH) {
                return 'Адрес криптокошелька слишком короткий';
              }
              if (value.length > MAX_CRYPTO_ADDRESS_LENGTH) {
                return 'Адрес криптокошелька слишком длинный';
              }

              // Проверка на допустимые символы
              if (!/^[a-zA-Z0-9]+$/.test(value)) {
                return 'Адрес может содержать только буквы и цифры';
              }

              return true;
            },
          }}
          render={({ field }) => {
            return (
              <Input
                label={t('withdrawal.walletAddress')}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.walletAddress}
                {...field}
              />
            );
          }}
        />
        {hasAttemptedSubmit && errors.walletAddress && (
          <p className={styles.errorMessage}>{errors.walletAddress.message}</p>
        )}

        <Controller
          name="memo"
          control={control}
          render={({ field }) => (
            <Input label={t('withdrawal.memo')} isGhost error={hasAttemptedSubmit && !!errors.memo} {...field} />
          )}
        />
        {hasAttemptedSubmit && errors.memo && <p className={styles.errorMessage}>{errors.memo.message}</p>}

        <Controller
          name="amount"
          control={control}
          rules={{
            validate: (value: string) => {
              const { minAmount: currentMinAmount, selectedMethod: currentMethod } = validationRef.current;

              if (!value || value.trim() === '') {
                return 'Введите сумму';
              }

              const num = Number.parseFloat(value);

              if (Number.isNaN(num) || num < currentMinAmount) {
                const currencyCode = currentMethod.currency?.code || '';

                return `Минимальная сумма ${currentMinAmount.toLocaleString('ru-RU')} ${currencyCode}`;
              }

              return true;
            },
          }}
          render={({ field }) => {
            const displayValue = field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';

            return (
              <Input
                ref={field.ref}
                label={minAmountLabel}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.amount}
                value={displayValue}
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

        <WithdrawalEligibilityErrors eligibilityData={eligibilityData} />

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
          {t('withdrawal.confirm')}
        </Button>
      </form>
    </div>
  );
};
