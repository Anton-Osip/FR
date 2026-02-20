import { ChangeEvent, FC, useState, useEffect, useMemo, useRef } from 'react';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '@shared/api';
import { copyToClipboard, getCurrencySymbol } from '@shared/lib';
import { Button, Input } from '@shared/ui';
import { CopyIcon, RadarIcon, TONWalletIcon, WalletIcon, XRocketIcon } from '@shared/ui/icons';

import styles from './CryptocurrencyPaymentContent.module.scss';
import { hasNetwork } from './helpers';
import { useCryptoPayment } from './useCryptoPayment';

import { useGetWalletDepositActiveQuery, useGetWalletDepositMethodsQuery } from '@features/wallet/api/walletApi.ts';
import type { WithdrawMethod } from '@features/wallet/model';
import { selectDepositActiveData, setDepositActiveData } from '@features/wallet/model';
import { AmountSteps } from '@features/wallet/ui/components/AmountSteps';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';
import { DropdownWallet } from '@features/wallet/ui/components/DropdownWallet';

interface TelegramcurrencyPaymentContentProps {
  portalContainer: HTMLElement | null;
  selectedMethod: WithdrawMethod;
}

interface DepositFormValues {
  amount: string;
}

const MAX_INPUT_LENGTH = 16;

export const TelegramcurrencyPaymentContent: FC<TelegramcurrencyPaymentContentProps> = ({ selectedMethod }) => {
  const dispatch = useAppDispatch();
  const depositActiveDataFromRedux = useAppSelector(selectDepositActiveData);

  // Используем данные из Redux как начальное значение
  const [isPayment, setIsPayment] = useState<boolean>(!!depositActiveDataFromRedux);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  // Получаем все методы депозита
  const { data: depositMethods } = useGetWalletDepositMethodsQuery();

  // Используем кастомный хук для управления логикой крипто-платежей
  const {
    telegramCryptoItems,
    network,
    minAmount,
    cryptoCode,
    botPayUrl,
    miniAppUrl,
    minAmountLabel,
    selectedMethodId,
    amountIcon,
    isLoading,
    isDepositLoading,
    handleMethodChange,
    handleDeposit,
  } = useCryptoPayment(selectedMethod);

  // Формируем параметры для запроса активного депозита
  const depositActiveParams = useMemo(() => {
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
  }, [selectedMethod, depositMethods]);

  const {
    data: depositActiveData,
    error: depositActiveError,
    isLoading: isDepositActiveLoading,
    refetch: refetchDepositActive,
  } = useGetWalletDepositActiveQuery(depositActiveParams || { method: '' }, {
    skip: !depositActiveParams,
    refetchOnMountOrArgChange: true,
  });

  // Обновляем данные в Redux и состояние при получении новых данных из запроса
  // Запрос автоматически обновляется при смене метода благодаря refetchOnMountOrArgChange
  useEffect(() => {
    if (depositActiveData) {
      dispatch(setDepositActiveData({ data: depositActiveData }));
      setIsPayment(true);
    } else if (!isDepositActiveLoading && depositActiveError) {
      // Запрос завершился и нет активного депозита
      dispatch(setDepositActiveData({ data: null }));
      setIsPayment(false);
    }
  }, [depositActiveData, depositActiveError, isDepositActiveLoading, dispatch]);

  // Используем данные из Redux как начальное значение при первой загрузке
  // После этого запрос в компоненте становится основным источником данных для переключения
  useEffect(() => {
    // Если запрос еще не выполнен (загрузка) и есть данные в Redux, используем их
    if (isDepositActiveLoading && depositActiveDataFromRedux) {
      setIsPayment(true);
    }
  }, [depositActiveDataFromRedux, isDepositActiveLoading]);

  // Выбираем данные в зависимости от состояния isPayment
  // Используем данные из Redux или из запроса
  const activeData = depositActiveDataFromRedux || depositActiveData;
  const displayBotPayUrl = isPayment ? activeData?.requisites?.bot_pay_url || '' : botPayUrl;
  const displayMiniAppUrl = isPayment ? activeData?.requisites?.mini_app_url || '' : miniAppUrl;

  // Приоритет: mini_app_url, если нет - bot_pay_url
  const paymentUrl = displayMiniAppUrl || displayBotPayUrl;
  const isMiniApp = !!displayMiniAppUrl;

  const handleCopyNetwork = async (): Promise<void> => {
    await copyToClipboard(network, 'Сеть скопирована', 'Сеть скопирована в буфер обмена');
  };

  const handleCopyLink = async (): Promise<void> => {
    await copyToClipboard(paymentUrl, 'Ссылка скопирована', 'Ссылка скопирована в буфер обмена');
  };

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(selectedMethod?.currency);
  }, [selectedMethod?.currency]);

  const minAmountNumber = useMemo(() => {
    return Number(minAmount) || 0;
  }, [minAmount]);

  // Ref для хранения актуальных значений — читается в момент вызова validate,
  // а не в момент создания замыкания. Обновляется при каждом рендере.
  const validationRef = useRef({ minAmountNumber, currencySymbol });

  // eslint-disable-next-line react-hooks/refs
  validationRef.current = { minAmountNumber, currencySymbol };

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<DepositFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      amount: minAmount,
    },
  });

  // Получаем текущее значение amount
  const amount = useWatch({ control, name: 'amount' });

  // Обновляем значения формы при изменении метода
  useEffect(() => {
    setValue('amount', minAmount, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
    setHasAttemptedSubmit(false);
  }, [selectedMethodId, minAmount, setValue]);

  const handleStepClick = (stepValue: string): void => {
    setValue('amount', stepValue);
    void trigger('amount');
  };

  const onSubmit = async (data: DepositFormValues): Promise<void> => {
    const success = await handleDeposit(data.amount);

    if (success) {
      // После успешного создания депозита запрашиваем активный депозит
      if (depositActiveParams) {
        await refetchDepositActive();
      }
      setIsPayment(true);
    }
  };

  const onClickHandlePayment = (): void => {
    setHasAttemptedSubmit(true);

    void handleSubmit(
      async data => {
        await onSubmit(data);
      },
      submitErrors => {
        if (submitErrors.amount) {
          setShakeKey(prev => prev + 1);
        }

        requestAnimationFrame(() => {
          if (submitErrors.amount) {
            amountInputRef.current?.focus();
          }
        });
      },
    )();
  };

  return (
    <div className={styles.container}>
      {!isPayment && (
        <>
          <form className={styles.form}>
            <DropdownWallet items={telegramCryptoItems} value={selectedMethodId} onChange={handleMethodChange} />
            <Controller
              key={`amount-${selectedMethodId}-${minAmount}`}
              name="amount"
              control={control}
              rules={{
                validate: (value: string) => {
                  const { minAmountNumber: currentMinAmount, currencySymbol: currentSymbol } = validationRef.current;

                  if (!value || value.trim() === '') {
                    return 'Введите сумму';
                  }
                  const num = Number(value);

                  if (Number.isNaN(num) || num < currentMinAmount) {
                    return `Минимальная сумма ${currentMinAmount.toLocaleString('ru-RU')} ${currentSymbol}`;
                  }

                  return true;
                },
              }}
              defaultValue={minAmount}
              render={({ field }) => {
                const handleAmountChange = (event: ChangeEvent<HTMLInputElement>): void => {
                  const value = event.target.value;

                  // Разрешаем пустую строку
                  if (value === '') {
                    field.onChange('');

                    return;
                  }

                  // Проверяем формат: цифры, одна точка, максимум 8 знаков после точки
                  if (/^\d+\.?\d{0,8}$/.test(value)) {
                    field.onChange(value);
                  }
                };

                return (
                  <>
                    <Input
                      ref={el => {
                        amountInputRef.current = el;
                        field.ref(el);
                      }}
                      label={minAmountLabel}
                      value={amount || minAmount}
                      onChange={handleAmountChange}
                      onBlur={field.onBlur}
                      type="text"
                      inputMode="decimal"
                      error={hasAttemptedSubmit && !!errors.amount}
                      shakeKey={hasAttemptedSubmit && !!errors.amount ? shakeKey : undefined}
                      isGhost
                      maxLength={MAX_INPUT_LENGTH}
                    />
                    {hasAttemptedSubmit && errors.amount && (
                      <p className={styles.errorMessage}>{errors.amount.message}</p>
                    )}
                  </>
                );
              }}
            />
          </form>
          <AmountSteps
            minAmount={minAmountNumber}
            buttonCount={8}
            currencySymbol={currencySymbol}
            value={amount}
            onChange={handleStepClick}
          />
        </>
      )}

      {isPayment && (
        <div className={styles.depositDetails}>
          <DepositDetailItem icon={amountIcon} label={'Минимальная сумма'} value={`${minAmount} ${cryptoCode}`} />
          <DepositDetailItem
            icon={<RadarIcon />}
            label={'Провайдер'}
            value={network}
            btnIcon={<CopyIcon />}
            onClickBtn={handleCopyNetwork}
          />
          {paymentUrl && (
            <DepositDetailItem
              icon={<WalletIcon />}
              label={'Ссылка для оплаты'}
              value={paymentUrl}
              btnIcon={<CopyIcon />}
              onClickBtn={handleCopyLink}
            />
          )}
        </div>
      )}

      {/*<BonusSection disabled portalContainer={portalContainer} />*/}
      <div className={styles.btnWrapper}>
        {isPayment && (
          <Button
            variant={isMiniApp ? 'primary' : 'accent'}
            className={styles.btnToken}
            icon={isMiniApp ? <TONWalletIcon /> : <XRocketIcon />}
            onClick={() => window.open(paymentUrl, '_blank')}
            disabled={isLoading || !paymentUrl}
          >
            Перейти для оплаты
          </Button>
        )}

        {!isPayment && (
          <Button
            variant={'primary'}
            className={styles.btnToken}
            onClick={onClickHandlePayment}
            disabled={isDepositLoading}
            icon={isDepositLoading ? <div className={styles.spinner} /> : undefined}
          >
            Подтвердить
          </Button>
        )}
      </div>
    </div>
  );
};
