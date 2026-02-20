import { FC, useEffect, useRef } from 'react';

import { useAppDispatch } from '@shared/api';
import { copyToClipboard } from '@shared/lib';
import { CopyIcon, RadarIcon } from '@shared/ui/icons';

import styles from './CryptocurrencyPaymentContent.module.scss';

import { useDepositMutation } from '@features/wallet/api/walletApi';
import { setDepositData, type WithdrawMethod } from '@features/wallet/model';
import { CryptoAddressCard } from '@features/wallet/ui/components/CryptoAddressCard';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

interface CryptocurrencyPaymentContentProps {
  portalContainer: HTMLElement | null;
  selectedMethod: WithdrawMethod;
}

export const CryptocurrencyPaymentContent: FC<CryptocurrencyPaymentContentProps> = ({ selectedMethod }) => {
  const dispatch = useAppDispatch();
  const isDepositRequestedRef = useRef(false);
  const depositMutationRef = useRef(false);
  const method = selectedMethod.code;
  const [deposit, { data: depositData, isLoading: isDepositLoading }] = useDepositMutation({
    fixedCacheKey: `shared-deposit-result-${method}`,
  });
  const address = depositData?.requisites?.address || '';
  let network: string = '';

  if ('network' in selectedMethod) {
    network = selectedMethod.network || '';
  }
  const minAmount = selectedMethod.min || 0;
  const amountIcon = selectedMethod.currency.icon?.url || '';
  const cryptoCode = selectedMethod.currency.code;

  const handleCopyNetwork = async (): Promise<void> => {
    await copyToClipboard(network, 'Сеть скопирована', 'Сеть скопирована в буфер обмена');
  };

  useEffect(() => {
    if (depositMutationRef.current) return;
    const createDeposit = async (): Promise<void> => {
      if (!selectedMethod || depositData || isDepositRequestedRef.current) {
        return;
      }

      isDepositRequestedRef.current = true;

      try {
        const depositParams = { method: selectedMethod.code };
        const result = await deposit(depositParams).unwrap();

        dispatch(setDepositData({ data: result }));
      } catch (error) {
        console.error('Failed to create deposit:', error);
        isDepositRequestedRef.current = false;
      }
    };

    void createDeposit();
    depositMutationRef.current = true;

    return () => {
      isDepositRequestedRef.current = false;
    };
  }, [selectedMethod, deposit, dispatch, depositData]);

  return (
    <div className={styles.container}>
      <div className={styles.depositDetails}>
        <DepositDetailItem icon={amountIcon} label={'Минимальная сумма'} value={`${minAmount} ${cryptoCode}`} />
        <DepositDetailItem
          icon={<RadarIcon />}
          label={'Провайдер'}
          value={network}
          btnIcon={<CopyIcon />}
          onClickBtn={handleCopyNetwork}
        />
        {(address || isDepositLoading) && (
          <CryptoAddressCard
            title={`Постоянный адрес ${network} (${cryptoCode})`}
            value={address}
            isLoading={isDepositLoading}
          />
        )}
      </div>
    </div>
  );
};
