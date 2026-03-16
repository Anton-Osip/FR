import { ChangeEvent, FC, useState, useEffect, useMemo, useRef } from 'react';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@shared/api';
import { copyToClipboard, getCurrencySymbol } from '@shared/lib';
import { Button, Input, toast } from '@shared/ui';
import { CopyIcon, RadarIcon, TONWalletIcon, WalletIcon, XRocketIcon } from '@shared/ui/icons';

import { BonusSection } from '../../components/BonusSection';

import styles from './CryptocurrencyPaymentContent.module.scss';
import { useCryptoPayment } from './useCryptoPayment';

import { setShowModal, WALLET_MODAL, WithdrawMethod } from '@features/wallet/model';
import { AmountSteps } from '@features/wallet/ui/components/AmountSteps';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';
import { DropdownWallet } from '@features/wallet/ui/components/DropdownWallet';

interface TelegramcurrencyPaymentContentProps {
  selectedMethod: WithdrawMethod;
}

interface DepositFormValues {
  amount: string;
}

const MAX_INPUT_LENGTH = 16;
const PARTS_LENGTH = 2; // Для ограничения знаков после запятой
const DECIMAL_PLACES = 8; // Для криптовалют можно оставить 8 знаков

export const TelegramcurrencyPaymentContent: FC<TelegramcurrencyPaymentContentProps> = ({ selectedMethod }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('walletModal');

  // Используем данные из Redux как начальное значение
  const [isPayment, setIsPayment] = useState<boolean>(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const prevRawLengthRef = useRef<number>(0);

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
    depositData,
    handleMethodChange,
    handleDeposit,
  } = useCryptoPayment(selectedMethod);

  const displayBotPayUrl = botPayUrl;
  const displayMiniAppUrl = miniAppUrl;

  // Приоритет: mini_app_url, если нет - bot_pay_url
  const paymentUrl = displayMiniAppUrl || displayBotPayUrl;
  const isMiniApp = !!displayMiniAppUrl;

  const handleCopyNetwork = async (): Promise<void> => {
    await copyToClipboard(
      network,
      t('telegramPayment.networkCopySuccess.title'),
      t('telegramPayment.networkCopySuccess.description'),
    );
  };

  const handleCopyLink = async (): Promise<void> => {
    await copyToClipboard(
      paymentUrl,
      t('telegramPayment.linkCopySuccess.title'),
      t('telegramPayment.linkCopySuccess.description'),
    );
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
      setIsPayment(true);
    } else {
      toast.error(t('telegramPayment.errors.title'), t('telegramPayment.errors.description'));
      dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }));
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
                    return t('telegramPayment.errors.enterAmount');
                  }

                  // Заменяем запятую на точку для парсинга
                  const normalizedValue = value.replace(',', '.');
                  const num = Number(normalizedValue);

                  if (Number.isNaN(num) || num < currentMinAmount) {
                    return t('telegramPayment.errors.minAmount', {
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

                  // Ограничиваем количество знаков после запятой (для криптовалют можно оставить 8 знаков)
                  if (parts.length === PARTS_LENGTH && parts[1].length > DECIMAL_PLACES) {
                    formattedValue = parts[0] + '.' + parts[1].slice(0, DECIMAL_PLACES);
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
                      label={minAmountLabel}
                      value={amount} // Убрали || minAmount
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
            customSteps={['5', '10', '50', '100', '150', '300']}
          />
          <BonusSection />
        </>
      )}

      {isPayment && (
        <div className={styles.depositDetails}>
          <DepositDetailItem
            icon={amountIcon}
            label={t('telegramPayment.transferAmount')}
            value={`${depositData?.requested.amount || '0'} ${cryptoCode}`}
          />
          <DepositDetailItem
            icon={<RadarIcon />}
            label={t('telegramPayment.provider')}
            value={network}
            btnIcon={<CopyIcon />}
            onClickBtn={handleCopyNetwork}
          />
          {paymentUrl && (
            <DepositDetailItem
              icon={<WalletIcon />}
              label={t('telegramPayment.paymentLink')}
              value={paymentUrl}
              btnIcon={<CopyIcon />}
              onClickBtn={handleCopyLink}
            />
          )}
        </div>
      )}

      <div className={styles.btnWrapper}>
        {isPayment && (
          <Button
            variant={isMiniApp ? 'primary' : 'accent'}
            className={styles.btnToken}
            icon={isMiniApp ? <TONWalletIcon /> : <XRocketIcon />}
            onClick={() => window.open(paymentUrl, '_blank')}
            disabled={isLoading || !paymentUrl}
          >
            {t('telegramPayment.goToPayment')}
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
            {t('telegramPayment.confirm')}
          </Button>
        )}
      </div>
    </div>
  );
};
