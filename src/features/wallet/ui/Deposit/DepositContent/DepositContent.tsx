import { FC, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider';

import { MethodCard } from '../../components/MethodCard';
import { getDepositActiveParams } from '../CryptocurrencyPaymentContent/helpers';

import styles from './DepositContent.module.scss';

import { useLazyGetWalletDepositActiveQuery } from '@features/wallet/api/walletApi';
import {
  type CryptoWithdrawMethod,
  type FiatWithdrawMethod,
  setDepositActiveData,
  setSelectedWithdrawMethod,
  setShowModal,
  type TelegramWithdrawAsset,
  WALLET_MODAL,
} from '@features/wallet/model';
import type { WalletDepositMethodsResponse } from '@features/wallet/model/apiTypes';

interface DepositContentProps {
  depositMethods?: WalletDepositMethodsResponse;
  isLoading?: boolean;
}

const DepositContent: FC<DepositContentProps> = ({ depositMethods, isLoading = false }) => {
  const { t } = useTranslation('walletModal');
  const dispatch = useDispatch();
  const [getDepositActive] = useLazyGetWalletDepositActiveQuery();
  // const [currency, setCurrency] = useState<string>('rub');

  const bankingClickHandler = async (method: FiatWithdrawMethod): Promise<void> => {
    try {
      await getDepositActive({ method: method.code }).unwrap();

      dispatch(setSelectedWithdrawMethod({ method }));
      dispatch(setShowModal({ showModal: WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT }));
    } catch {
      dispatch(setSelectedWithdrawMethod({ method }));
      dispatch(setShowModal({ showModal: WALLET_MODAL.BANK_PAYMENT }));
    }
  };

  const handleCryptoMethodClick = useCallback(
    (method: CryptoWithdrawMethod | TelegramWithdrawAsset) => {
      dispatch(setSelectedWithdrawMethod({ method }));
      dispatch(setShowModal({ showModal: WALLET_MODAL.CRYPTOCURRENCY_PAYMENT_CONTENT }));
    },
    [dispatch],
  );

  const handleTelegramMethodClick = useCallback(
    async (method: CryptoWithdrawMethod | TelegramWithdrawAsset) => {
      dispatch(setSelectedWithdrawMethod({ method }));

      // Проверяем активный депозит заранее
      if (depositMethods) {
        const params = getDepositActiveParams(method, depositMethods);

        if (params) {
          try {
            const activeData = await getDepositActive(params).unwrap();

            dispatch(setDepositActiveData({ data: activeData }));
          } catch {
            // Если активного депозита нет, очищаем данные
            dispatch(setDepositActiveData({ data: null }));
          }
        }
      }

      dispatch(setShowModal({ showModal: WALLET_MODAL.TELEGRAMCURRENCY_PAYMENT_CONTENT }));
    },
    [dispatch, depositMethods, getDepositActive],
  );

  return (
    <div className={styles.deposit}>
      <BannerSlider />
      {/*<PaymentRegionSelector value={currency} onChange={setCurrency} />*/}

      <div className={styles.method}>
        <h3 className={styles.title}>{t('methods.banking')}</h3>
        <div className={styles.fiatGrid}>
          {isLoading || !depositMethods?.fiat ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            depositMethods.fiat.map((m, idx) => (
              <MethodCard
                onClick={() => bankingClickHandler(m)}
                key={`fiat-${m.code}-${idx}`}
                title={m.title}
                currency={m.currency}
                min={m.min}
                media={m.media}
                isBanking
              />
            ))
          )}
        </div>
      </div>

      <div className={styles.method}>
        <h3 className={styles.title}>{t('methods.crypto')}</h3>
        <div className={styles.cryptoGrid}>
          {isLoading || !depositMethods?.crypto ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            depositMethods.crypto.map((m, idx) => (
              <MethodCard
                onClick={() => handleCryptoMethodClick(m)}
                key={`crypto-${m.code}-${idx}`}
                title={m.title}
                currency={m.currency}
                min={m.min}
                network={m.network}
                media={m.media}
              />
            ))
          )}
          {isLoading || !depositMethods?.telegram ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            depositMethods.telegram.flatMap((m, methodIdx) =>
              m.assets.map((asset, assetIdx) => (
                <MethodCard
                  onClick={() => handleTelegramMethodClick(asset)}
                  key={`telegram-${m.code}-${asset.code}-${methodIdx}-${assetIdx}`}
                  title={asset.title}
                  currency={asset.currency}
                  min={asset.min}
                  network={asset.network}
                  media={asset.media}
                />
              )),
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositContent;
