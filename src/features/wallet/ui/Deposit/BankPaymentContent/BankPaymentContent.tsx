import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useAppDispatch } from '@shared/api';
import { formatAmount, getCurrencySymbol } from '@shared/lib';
import { Button, Input, Spinner } from '@shared/ui';

// import { BonusSection } from '../../components/BonusSection';

import styles from './BankPaymentContent.module.scss';

import { useDepositMutation, useGetWalletDepositActiveQuery } from '@features/wallet/api/walletApi';
import { WALLET_MODAL, setShowModal, type WithdrawMethod } from '@features/wallet/model';
import { AmountSteps } from '@features/wallet/ui/components/AmountSteps';

// Константа для конвертации процентов
const PERCENT_TO_DECIMAL = 100;
const POLLING_TIMEOUT_MS = 90000;
const POLLING_INTERVAL_MS = 10000; // 10 секунд

interface BankPaymentContentProps {
  selectedMethod: WithdrawMethod;
  portalContainer: HTMLElement | null;
}

interface DepositFormValues {
  amount: string;
}

const getMinAmount = (method: WithdrawMethod): string => {
  if ('min' in method) {
    const minValue = method.min;

    if (minValue === null) return '0';

    return typeof minValue === 'string' ? minValue : String(minValue);
  }

  return '0';
};

const MAX_INPUT_LENGTH = 16;

export const BankPaymentContent: FC<BankPaymentContentProps> = ({ selectedMethod }) => {
  const method = selectedMethod.code;
  const requiresBankSelection = method !== 'nspk';
  const dispatch = useAppDispatch();
  const minAmount = getMinAmount(selectedMethod);
  const minAmountNumber = Number(minAmount);
  const prevRawLengthRef = useRef<number>(0);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const bankSelectorRef = useRef<HTMLDivElement | null>(null);
  const [deposit, { isLoading: isDepositLoading }] = useDepositMutation();

  const [shouldPoll, setShouldPoll] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  const { data: activeData, error: rtkError } = useGetWalletDepositActiveQuery(
    { method },
    {
      pollingInterval: shouldPoll ? POLLING_INTERVAL_MS : 0, // 10 секунд, только если shouldPoll = true
      skip: !shouldPoll, // Пропускаем запрос, если поллинг не нужен
    },
  );

  const currencySymbol = getCurrencySymbol(selectedMethod.currency);

  // Ref для хранения актуальных значений — читается в момент вызова validate,
  // а не в момент создания замыкания. Обновляется при каждом рендере.
  const validationRef = useRef({ minAmountNumber, currencySymbol, requiresBankSelection });

  // eslint-disable-next-line react-hooks/refs
  validationRef.current = { minAmountNumber, currencySymbol, requiresBankSelection };

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

  const amount = useWatch({ control, name: 'amount' });

  useEffect(() => {
    if (shouldPoll && activeData) {
      setShouldPoll(false);
      setPollingStartTime(null);
      dispatch(setShowModal({ showModal: WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT }));
    }
  }, [activeData, shouldPoll, dispatch]);

  useEffect(() => {
    if (rtkError && shouldPoll) {
      console.error('Polling error:', rtkError);
      // Ошибка логируется, но поллинг продолжается (RTK сам управляет повторами)
    }
  }, [rtkError, shouldPoll]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (shouldPoll && pollingStartTime) {
      const elapsed = Date.now() - pollingStartTime;
      const remaining = Math.max(0, POLLING_TIMEOUT_MS - elapsed);

      if (remaining <= 0) {
        // Время вышло
        setShouldPoll(false);
        setPollingStartTime(null);
      } else {
        // Устанавливаем таймер на оставшееся время
        timeoutId = setTimeout(() => {
          setShouldPoll(false);
          setPollingStartTime(null);
        }, remaining);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [shouldPoll, pollingStartTime]);

  useEffect(() => {
    return () => {
      setShouldPoll(false);
      setPollingStartTime(null);
    };
  }, []);

  // Обновляем значения формы при изменении метода
  useEffect(() => {
    setValue('amount', minAmount, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
    setHasAttemptedSubmit(false);
    setShouldPoll(false);
    setPollingStartTime(null);
  }, [selectedMethod.code, minAmount, setValue]);

  const amountToDeposit = (): string => {
    if (!amount) return '—';
    const numAmount = Number(amount);

    if (Number.isNaN(numAmount) || numAmount === 0) return '—';

    const fee = 'fee' in selectedMethod ? selectedMethod.fee : null;
    let totalAmount = numAmount;

    if (fee && fee.enabled === 'true') {
      const percentFee = Number(fee.percent) || 0;
      const fixedFee = Number(fee.fixed) || 0;

      const calculatedFee = (numAmount * percentFee) / PERCENT_TO_DECIMAL + fixedFee;

      totalAmount = numAmount + calculatedFee;
    }

    return `${formatAmount(totalAmount)} ${currencySymbol}`;
  };

  const handleStepClick = (stepValue: string): void => {
    setValue('amount', stepValue);
    void trigger('amount');
  };

  const onSubmit = async (data: DepositFormValues): Promise<void> => {
    // Отправляем запрос (не ждем результат и не обрабатываем ошибки)
    deposit({
      method,
      amount: data.amount,
    });

    setShouldPoll(true);
    setPollingStartTime(Date.now());
  };

  const handleContinue = (): void => {
    setHasAttemptedSubmit(true);

    void handleSubmit(
      async data => {
        await onSubmit(data);
      },
      submitErrors => {
        // Увеличиваем ключ для перезапуска анимации тряски при каждой ошибке
        if (submitErrors.amount) {
          setShakeKey(prev => prev + 1);
        }

        requestAnimationFrame(() => {
          if (requiresBankSelection) {
            bankSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else if (submitErrors.amount) {
            amountInputRef.current?.focus();
          }
        });
      },
    )();
  };

  if (shouldPoll) {
    return (
      <div className={styles.container}>
        <div className={clsx(styles.emptyState)}>
          <Spinner />
          <span className={styles.title}>Не закрывай окно</span>
          <span className={styles.subtitle}>
            Идет поиск реквизитов. <br /> Процесс может занять до 60 секунд...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Controller
        key={`amount-${selectedMethod.code}-${minAmount}`}
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
            const rawValue = event.target.value;
            const numericValue = rawValue.replace(/\D/g, '');
            const prevNumericValue = field.value;
            const prevRawLength = prevRawLengthRef.current || prevNumericValue.length;

            if (
              numericValue.length === prevNumericValue.length &&
              rawValue.length < prevRawLength &&
              prevNumericValue.length > 0
            ) {
              const shortened = prevNumericValue.slice(0, -1);

              field.onChange(shortened);
              prevRawLengthRef.current = shortened.length;

              return;
            }

            field.onChange(numericValue);
            prevRawLengthRef.current = numericValue.length;
          };

          return (
            <>
              <Input
                ref={el => {
                  amountInputRef.current = el;
                  field.ref(el);
                }}
                value={amount || minAmount}
                onChange={handleAmountChange}
                onBlur={field.onBlur}
                label={`Мин. сумма ${minAmount} ${currencySymbol}`}
                maxLength={MAX_INPUT_LENGTH}
                error={hasAttemptedSubmit && !!errors.amount}
                shakeKey={hasAttemptedSubmit && !!errors.amount ? shakeKey : undefined}
                isGhost
              />
              {hasAttemptedSubmit && errors.amount && <p className={styles.errorMessage}>{errors.amount.message}</p>}
            </>
          );
        }}
      />

      <AmountSteps
        minAmount={minAmountNumber}
        buttonCount={8}
        currencySymbol={currencySymbol}
        value={amount}
        onChange={handleStepClick}
      />

      {/* <BonusSection portalContainer={portalContainer} /> */}

      <div className={styles.list}>
        <div className={styles.item}>
          <p className={styles.title}>К пополнению</p>
          <p className={styles.value}>{amountToDeposit()}</p>
        </div>
      </div>

      <Button
        variant={'primary'}
        fullWidth={true}
        onClick={handleContinue}
        disabled={isDepositLoading}
        icon={isDepositLoading ? <div className={styles.spinner} /> : undefined}
      >
        Продолжить
      </Button>
    </div>
  );
};
