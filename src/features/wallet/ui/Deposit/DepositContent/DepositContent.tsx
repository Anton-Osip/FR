import { FC, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
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
import { MoreMethods } from '@features/wallet/ui/components/MoreMethods';

interface DepositContentProps {
  depositMethods?: WalletDepositMethodsResponse;
  isLoading?: boolean;
}

const SLICE_QUANTITY = 3;
const QUANTITY_PROPS = 5;

const DepositContent: FC<DepositContentProps> = ({ depositMethods, isLoading = false }) => {
  const { t } = useTranslation('walletModal');
  const dispatch = useDispatch();
  const [getDepositActive] = useLazyGetWalletDepositActiveQuery();
  // const [currency, setCurrency] = useState<string>('rub');
  const [cryptoIsShow, setCryptoIsShow] = useState<boolean>(false);
  const [telegramIsShow, setTelegramIsShow] = useState<boolean>(false);
  const [fiatIsShow, setFiatIsShow] = useState<boolean>(false);

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

  const getTelegramAssetsCount = useCallback((): number => {
    if (!depositMethods?.telegram) return 0;

    return depositMethods.telegram.reduce((acc, method) => acc + method.assets.length, 0);
  }, [depositMethods]);

  const getDisplayedTelegramAssets = useCallback(() => {
    if (!depositMethods?.telegram) return [];

    const allAssets = depositMethods.telegram.flatMap(m => m.assets);

    if (telegramIsShow) {
      return allAssets;
    }

    return allAssets.slice(0, SLICE_QUANTITY);
  }, [depositMethods, telegramIsShow]);

  const cryptoData = cryptoIsShow ? depositMethods?.crypto : depositMethods?.crypto.slice(0, SLICE_QUANTITY);
  const fiatData = fiatIsShow ? depositMethods?.fiat : depositMethods?.fiat.slice(0, SLICE_QUANTITY);
  const telegramAssetsCount = getTelegramAssetsCount();
  const displayedTelegramAssets = getDisplayedTelegramAssets();

  useEffect(() => {
    if (depositMethods?.fiat && depositMethods.fiat.length < QUANTITY_PROPS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiatIsShow(true);
    }
    if (depositMethods?.crypto && depositMethods.crypto.length < QUANTITY_PROPS) {
      setCryptoIsShow(true);
    }

    if (depositMethods?.telegram && getTelegramAssetsCount() < QUANTITY_PROPS) {
      setTelegramIsShow(true);
    }
  }, [depositMethods, getTelegramAssetsCount]);

  return (
    <div className={styles.deposit}>
      <BannerSlider />
      {/*<PaymentRegionSelector value={currency} onChange={setCurrency} />*/}

      <div className={styles.method}>
        {depositMethods?.fiat.length !== 0 && (
          <>
            <h3 className={styles.title}>{t('methods.banking')}</h3>
            <div className={clsx(styles.grid, styles.fiatGrid)}>
              {isLoading || !fiatData ? (
                <>
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </>
              ) : (
                <>
                  {fiatData.map((m, idx) => (
                    <MethodCard
                      onClick={() => bankingClickHandler(m)}
                      key={`fiat-${m.code}-${idx}`}
                      title={m.title}
                      currency={m.currency}
                      min={m.min}
                      media={m.media}
                      isBanking
                    />
                  ))}
                  <MoreMethods
                    quantity={depositMethods!.fiat.length}
                    isMore={fiatIsShow}
                    onClick={() => setFiatIsShow(prevState => !prevState)}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.method}>
        {depositMethods?.telegram.length !== 0 && (
          <>
            <h3 className={styles.title}>{t('methods.telegramCrypto')}</h3>
            <div className={styles.grid}>
              {isLoading || !depositMethods?.telegram ? (
                <>
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </>
              ) : (
                <>
                  {displayedTelegramAssets.map((asset, index) => {
                    return (
                      <MethodCard
                        onClick={() => handleTelegramMethodClick(asset)}
                        key={`telegram-${asset.code}-${index}`}
                        title={asset.currency.code}
                        currency={asset.currency}
                        min={asset.min}
                        network={asset.network}
                        media={asset.media}
                      />
                    );
                  })}

                  <MoreMethods
                    quantity={telegramAssetsCount}
                    onClick={() => {
                      setTelegramIsShow(prevState => !prevState);
                    }}
                    isMore={telegramIsShow}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.method}>
        {depositMethods?.crypto.length !== 0 && (
          <>
            <h3 className={styles.title}>{t('methods.crypto')}</h3>
            <div className={styles.grid}>
              {isLoading || !cryptoData ? (
                <>
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </>
              ) : (
                <>
                  {cryptoData.map((m, idx) => (
                    <MethodCard
                      onClick={() => handleCryptoMethodClick(m)}
                      key={`crypto-${m.code}-${idx}`}
                      title={m.title}
                      min={m.min}
                      currency={m.currency}
                      network={m.network}
                      media={m.media}
                    />
                  ))}
                  <MoreMethods
                    quantity={depositMethods!.crypto.length}
                    onClick={() => {
                      setCryptoIsShow(prevState => !prevState);
                    }}
                    isMore={cryptoIsShow}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositContent;
