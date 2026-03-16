import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { formatAmount, getCurrencySymbol } from '@shared/lib';
import { Button, EmptyState, Input, Spinner } from '@shared/ui';

import { BonusSection } from '../../components/BonusSection';

import styles from './BankPaymentContent.module.scss';

import { useDepositMutation, useGetWalletDepositActiveQuery } from '@features/wallet/api/walletApi';
import { usePollingManager } from '@features/wallet/hooks';
import { type WithdrawMethod } from '@features/wallet/model';
import { AmountSteps } from '@features/wallet/ui/components/AmountSteps';

interface BankPaymentContentProps {
  selectedMethod: WithdrawMethod;
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
const PARTS_LENGTH = 2;
const PERCENT_TO_DECIMAL = 100;

export const BankPaymentContent: FC<BankPaymentContentProps> = ({ selectedMethod }) => {
  const method = selectedMethod.code;
  const requiresBankSelection = method !== 'nspk';
  const minAmount = getMinAmount(selectedMethod);
  const minAmountNumber = Number(minAmount);
  const prevRawLengthRef = useRef<number>(0);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const bankSelectorRef = useRef<HTMLDivElement | null>(null);
  const [deposit, { isLoading: isDepositLoading }] = useDepositMutation();
  const { startPolling, isPollingActive, paymentDetailsError } = usePollingManager({ method });
  const { t } = useTranslation('walletModal');

  // Делаем запрос прямо в компоненте
  void useGetWalletDepositActiveQuery(
    { method },
    {
      skip: !isPollingActive,
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

  // Обновляем значения формы при изменении метода
  useEffect(() => {
    setValue('amount', minAmount, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
    setHasAttemptedSubmit(false);
    // setShouldPoll(false);
    // setPollingStartTime(null);
  }, [selectedMethod.code, minAmount, setValue]);

  const amountToDeposit = useMemo(() => {
    if (!amount) return '0';
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

    // Рассчитываем итоговую сумму с учетом бонуса

    return `${formatAmount(totalAmount)} ${currencySymbol}`;
  }, [amount, selectedMethod, currencySymbol]);

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

    startPolling();
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

  if (isPollingActive) {
    return (
      <div className={styles.container}>
        <div className={clsx(styles.emptyState)}>
          <Spinner />
          <span className={styles.title}>{t('bankPayment.polling.title')}</span>
          <span className={styles.subtitle}>{t('bankPayment.polling.subtitle')}</span>
        </div>
      </div>
    );
  }

  if (paymentDetailsError) {
    return (
      <div className={styles.container}>
        <EmptyState title={t('polling.error.title')} subtitle={t('polling.error.description')} />
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
              return t('bankPayment.errors.enterAmount');
            }

            // Заменяем запятую на точку для парсинга
            const normalizedValue = value.replace(',', '.');
            const num = Number(normalizedValue);

            if (Number.isNaN(num) || num < currentMinAmount) {
              return t('bankPayment.errors.minAmount', {
                amount: currentMinAmount.toLocaleString('ru-RU'),
                currency: currentSymbol,
              });
            }

            return true;
          },
        }}
        defaultValue={minAmount}
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

            if (parts.length > PARTS_LENGTH) {
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
              formattedValue = parts.length === PARTS_LENGTH ? parts[0] + '.' + parts[1] : parts[0];
            }

            // Если целая часть начинается с 0 и есть десятичная часть
            if (parts[0] === '0' && parts.length === PARTS_LENGTH) {
              formattedValue = '0.' + parts[1];
            }

            // Ограничиваем количество знаков после запятой (например, до 2)
            if (parts.length === PARTS_LENGTH && parts[1].length > PARTS_LENGTH) {
              formattedValue = parts[0] + '.' + parts[1].slice(0, PARTS_LENGTH);
            }

            // Ограничиваем общую длину
            if (formattedValue.length > MAX_INPUT_LENGTH) {
              formattedValue = formattedValue.slice(0, MAX_INPUT_LENGTH);
            }

            field.onChange(formattedValue);
            prevRawLengthRef.current = formattedValue.length;
          };

          return (
            <>
              <Input
                ref={el => {
                  amountInputRef.current = el;
                  field.ref(el);
                }}
                value={amount}
                onChange={handleAmountChange}
                onBlur={field.onBlur}
                label={t('bankPayment.minAmountLabel', {
                  amount: minAmount,
                  currency: currencySymbol,
                })}
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
      <BonusSection />
      <div className={styles.list}>
        <div className={styles.item}>
          <p className={styles.title}>{t('bankPayment.toDeposit')}</p>
          <p className={styles.value}>{amountToDeposit}</p>
        </div>
      </div>
      <Button
        variant={'primary'}
        fullWidth={true}
        onClick={handleContinue}
        disabled={isDepositLoading}
        icon={isDepositLoading ? <div className={styles.spinner} /> : undefined}
      >
        {t('bankPayment.continue')}
      </Button>
    </div>
  );
};
