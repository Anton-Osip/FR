import { ChangeEvent, type ElementType, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useAppDispatch } from '@shared/api';
import { useDebounce, getCurrencySymbol } from '@shared/lib';
import { Button, Input, toast } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp';

import styles from './WithdrawalByCryptocurrencyContent.module.scss';

import {
  useGetWalletWithdrawMethodsQuery,
  useLazyGetWalletWithdrawEligibilityQuery,
  useWithdrawMutation,
} from '@features/wallet/api/walletApi';
import { formatCryptoAmount, getMinAmount, parseAmount } from '@features/wallet/lib/utils';
import { resetModal, setSelectedWithdrawMethod, type WithdrawMethod } from '@features/wallet/model';
import type { CryptoWithdrawMethod, TelegramWithdrawAsset } from '@features/wallet/model/apiTypes';
import { DropdownWallet } from '@features/wallet/ui/components/DropdownWallet';
import { WithdrawalEligibilityErrors } from '@features/wallet/ui/components/WithdrawalEligibilityErrors';

const ELIGIBILITY_CHECK_DEBOUNCE_MS = 500;
const FOCUS_DELAY_MS = 100;
const PRECISION_NUMBER = 6;
const MAX_INPUT_LENGTH = 16;
const MAX_COUNT_CHECK_ELIGIBILITY = 2;

interface Props {
  selectedMethod: WithdrawMethod;
}

interface WithdrawalFormValues {
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

export const WithdrawalByTelegramcurrencyContent: FC<Props> = ({ selectedMethod }) => {
  const { t } = useTranslation('walletModal');
  const appDispatch = useAppDispatch();
  const dispatch = useDispatch();
  const { data: withdrawMethods, isLoading } = useGetWalletWithdrawMethodsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const [
    checkEligibility,
    { data: eligibilityData, isLoading: isEligibilityLoading, isFetching: isEligibilityFetching },
  ] = useLazyGetWalletWithdrawEligibilityQuery();
  const [countCheckEligibility, setCountCheckEligibility] = useState<number>(0);
  const minAmount = useMemo(() => getMinAmount(selectedMethod), [selectedMethod]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const currencySymbol = getCurrencySymbol(selectedMethod.currency);

  // Ref для хранения актуальных значений валидации
  const validationRef = useRef({ minAmount, selectedMethod, currencySymbol });
  const prevRawLengthRef = useRef<number>(0);

  validationRef.current = { minAmount, selectedMethod, currencySymbol };
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
      amount: minAmount.toString(),
    },
  });

  const formValues = watch();
  const debouncedFormValues = useDebounce(formValues, ELIGIBILITY_CHECK_DEBOUNCE_MS);

  // Проверка готовности формы к проверке eligibility
  const isReadyForEligibilityCheck = useMemo(() => {
    const numAmount = parseAmount(debouncedFormValues.amount);

    return !!(debouncedFormValues.amount && isValid && !Number.isNaN(numAmount) && numAmount >= minAmount);
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

    return {
      method,
      amount: debouncedFormValues.amount,
      asset_code: getMethodParams().asset_code || undefined,
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
    const requestKey = `${requestParams.method}|${requestParams.amount || minAmount.toString()}|${requestParams.asset_code || ''}`;

    // Проверяем, изменились ли параметры
    if (prevRequestParamsRef.current === requestKey) {
      return;
    }

    // Обновляем предыдущие параметры и отправляем запрос
    prevRequestParamsRef.current = requestKey;
    checkEligibility(requestParams);
    setCountCheckEligibility(prevState => prevState + 1);
  }, [requestParams, checkEligibility, minAmount]);

  const withdrawablePayout: string = useMemo(() => {
    const precision = eligibilityData?.account?.currency.precision || PRECISION_NUMBER;
    const withdrawalNumber = Number(eligibilityData?.account?.payout ?? 0);
    const formattedValue = Number.isNaN(withdrawalNumber) ? 0 : withdrawalNumber;

    return formatCryptoAmount(formattedValue, precision);
  }, [eligibilityData?.account?.currency.precision, eligibilityData?.account?.payout]);

  const withdrawableCurrency = useMemo(() => {
    if (eligibilityData?.account?.currency) {
      return getCurrencySymbol(eligibilityData?.account?.currency);
    }

    return getCurrencySymbol(selectedMethod.currency);
  }, [eligibilityData?.account?.currency, selectedMethod.currency]);

  const availableForWithdrawal = useMemo(() => {
    const withdrawalValue = eligibilityData?.fee_aware_withdrawable ?? eligibilityData?.withdrawable ?? 0;
    const withdrawalNumber = Number(withdrawalValue);
    const formattedValue = Number.isNaN(withdrawalNumber) ? 0 : withdrawalNumber;
    const precision = Number(eligibilityData?.withdrawable_currency.precision ?? PRECISION_NUMBER);
    const currencySymbol =
      eligibilityData?.withdrawable_currency.symbol?.trim() || selectedMethod.currency.symbol.trim();

    return `${formatCryptoAmount(formattedValue, precision)} ${currencySymbol}`;
  }, [
    eligibilityData?.fee_aware_withdrawable,
    eligibilityData?.withdrawable,
    eligibilityData?.withdrawable_currency.precision,
    eligibilityData?.withdrawable_currency.symbol,
    selectedMethod.currency.symbol,
  ]);

  // Обновляем значения формы при изменении метода
  useEffect(() => {
    setValue('amount', minAmount.toString(), {
      shouldValidate: true,
      shouldDirty: false,
      shouldTouch: false,
    });
    setHasAttemptedSubmit(false);
  }, [selectedMethod.code, minAmount, setValue]);

  const allCryptoItems = useMemo((): DropdownMenuItems[] => {
    const items: DropdownMenuItems[] = [];

    // Добавляем telegram методы (развернутые в assets)
    if (withdrawMethods?.telegram) {
      const telegramItems = withdrawMethods.telegram.flatMap(telegramMethod =>
        telegramMethod.assets.map(asset =>
          createMenuItem(asset.code, asset.network, asset.title, asset?.currency?.icon?.url),
        ),
      );

      items.push(...telegramItems);
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

  const onSubmit = async (data: WithdrawalFormValues): Promise<void> => {
    try {
      setBtnIsLoading(true);
      const { method, asset_code } = getMethodParams();

      // Проверяем eligibility перед отправкой запроса
      const eligibilityParams = {
        method,
        amount: data.amount,
        asset_code: asset_code || undefined,
      };

      const eligibilityResult = await checkEligibility(eligibilityParams).unwrap();

      setCountCheckEligibility(prevState => prevState + 1);

      // Если eligibility не пройдена, показываем ошибку и не отправляем запрос
      if (!eligibilityResult.eligible) {
        // Маппинг полей из API на поля формы
        const fieldMapping: Record<string, keyof WithdrawalFormValues> = {
          amount: 'amount',
        };

        // Устанавливаем ошибки для полей с ошибками
        const errorFields = [...(eligibilityResult.invalid_fields || []), ...(eligibilityResult.missing_fields || [])];

        errorFields.forEach(fieldName => {
          const formFieldName = fieldMapping[fieldName];

          if (formFieldName) {
            const isMissing = eligibilityResult.missing_fields?.includes(fieldName);
            const errorMessage = isMissing
              ? t('withdrawalByTelegram.errors.requiredField')
              : t('withdrawalByTelegram.errors.invalidField');

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

        return;
      }

      await withdraw({
        method,
        amount: data.amount,
        asset_code,
      }).unwrap();

      toast.success(t('withdrawalByTelegram.success.title'), t('withdrawalByTelegram.success.description'));

      dispatch(resetModal());
    } catch (error) {
      console.error('Ошибка при выводе средств:', error);
      toast.error(t('withdrawalByTelegram.errors.withdrawalError'), t('withdrawalByTelegram.errors.contactSupport'));
    } finally {
      setBtnIsLoading(false);
    }
  };

  const handleContinue = async (): Promise<void> => {
    setHasAttemptedSubmit(true);

    // Валидируем все поля по порядку, чтобы найти первое с ошибкой
    const fieldOrder: (keyof WithdrawalFormValues)[] = ['amount'];

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

    return t('withdrawalByTelegram.labels.minAmount', { amount: minAmount, currency: currencyCode });
  }, [selectedMethod.currency?.code, minAmount, t]);

  if (isLoading) {
    return <div className={styles.container}>{t('withdrawalByTelegram.loading')}</div>;
  }

  if (!allCryptoItems.length) {
    return <div className={styles.container}>{t('withdrawalByTelegram.noMethods')}</div>;
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
          name="amount"
          control={control}
          rules={{
            validate: (value: string) => {
              const { minAmount: currentMinAmount, currencySymbol } = validationRef.current;

              if (!value || value.trim() === '') {
                return t('withdrawalByTelegram.validation.enterAmount');
              }

              // Заменяем запятую на точку для парсинга
              const normalizedValue = value.replace(',', '.');
              const num = Number(normalizedValue);

              if (Number.isNaN(num) || num < currentMinAmount) {
                return t('withdrawalByTelegram.validation.minAmount', {
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
                label={minAmountLabel}
                isGhost
                type="text"
                inputMode="numeric"
                error={hasAttemptedSubmit && !!errors.amount}
                value={formValues.amount}
                onChange={handleAmountChange}
                onBlur={field.onBlur}
              />
            );
          }}
        />
        {hasAttemptedSubmit && errors.amount && <p className={styles.errorMessage}>{errors.amount.message}</p>}

        {!errors.amount && countCheckEligibility >= MAX_COUNT_CHECK_ELIGIBILITY && (
          <WithdrawalEligibilityErrors eligibilityData={eligibilityData} />
        )}
        <p className={styles.currentBalance}>
          {t('withdrawalByTelegram.availableForWithdrawal')}{' '}
          {isEligibilityLoading || isEligibilityFetching ? (
            <span className={styles.valueSkeleton} />
          ) : (
            <>{availableForWithdrawal}</>
          )}
        </p>
        <div className={styles.currentAccount}>
          <p className={styles.text}>{t('withdrawalByTelegram.willBeCredited')}</p>
          <p className={styles.value}>
            {isEligibilityLoading || isEligibilityFetching ? (
              <span className={styles.valueSkeleton} />
            ) : (
              <>
                {withdrawablePayout} {withdrawableCurrency}
              </>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          fullWidth={true}
          disabled={isWithdrawing}
          onClick={handleContinue}
          icon={btnIsLoading ? <div className={styles.spinner} /> : undefined}
          className={clsx(isWithdrawing && styles.loadingButton)}
        >
          {t('withdrawalByTelegram.confirm')}
        </Button>
      </form>
    </div>
  );
};
