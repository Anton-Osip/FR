import { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@shared/api';
import { copyToClipboard } from '@shared/lib';
import { CopyIcon, RadarIcon } from '@shared/ui/icons';

import { BonusSection } from '../../components/BonusSection';

import styles from './CryptocurrencyPaymentContent.module.scss';

import { useDepositMutation } from '@features/wallet/api/walletApi';
import { setDepositData, type WithdrawMethod } from '@features/wallet/model';
import { CryptoAddressCard } from '@features/wallet/ui/components/CryptoAddressCard';
import { DepositDetailItem } from '@features/wallet/ui/components/DepositDetailItem';

interface CryptocurrencyPaymentContentProps {
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
  const { t } = useTranslation('walletModal');
  const address = depositData?.requisites?.address || '';
  let network: string = '';

  if ('network' in selectedMethod) {
    network = selectedMethod.network || '';
  }
  const minAmount = selectedMethod.min || 0;
  const amountIcon = selectedMethod.currency.icon?.url || '';
  const cryptoCode = selectedMethod.currency.code;

  const handleCopyNetwork = async (): Promise<void> => {
    await copyToClipboard(
      network,
      t('cryptoPayment.networkCopySuccess.title'),
      t('cryptoPayment.networkCopySuccess.description'),
    );
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
        <DepositDetailItem
          icon={amountIcon}
          label={t('cryptoPayment.minAmount')}
          value={`${minAmount} ${cryptoCode}`}
        />
        <DepositDetailItem
          icon={<RadarIcon />}
          label={t('cryptoPayment.provider')}
          value={network}
          btnIcon={<CopyIcon />}
          onClickBtn={handleCopyNetwork}
        />
        <BonusSection />
        {(address || isDepositLoading) && (
          <CryptoAddressCard
            title={t('cryptoPayment.permanentAddress', { network, cryptoCode })}
            value={address}
            isLoading={isDepositLoading}
          />
        )}
      </div>
    </div>
  );
};
