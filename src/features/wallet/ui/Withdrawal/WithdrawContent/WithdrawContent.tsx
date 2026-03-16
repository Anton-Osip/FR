import { FC, useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider';

import { MethodCard } from '../../components/MethodCard';

import styles from './WithdrawContent.module.scss';

import { setSelectedWithdrawMethod, setShowModal, WALLET_MODAL } from '@features/wallet/model';
import type { FiatWithdrawMethod, WalletWithdrawMethodsResponse } from '@features/wallet/model/apiTypes';
import { MoreMethods } from '@features/wallet/ui/components/MoreMethods';

interface WithdrawContentProps {
  withdrawMethods?: WalletWithdrawMethodsResponse;
  isLoading?: boolean;
}
const SLICE_QUANTITY = 3;
const QUANTITY_PROPS = 5;

export const WithdrawContent: FC<WithdrawContentProps> = ({ withdrawMethods, isLoading = false }) => {
  const { t } = useTranslation('walletModal');
  const dispatch = useDispatch();
  const [cryptoIsShow, setCryptoIsShow] = useState<boolean>(false);
  const [telegramIsShow, setTelegramIsShow] = useState<boolean>(false);
  const [fiatIsShow, setFiatIsShow] = useState<boolean>(false);

  const onClickHandler = (method: FiatWithdrawMethod): void => {
    dispatch(setSelectedWithdrawMethod({ method }));
    if (method.code === 'card_number') {
      dispatch(setShowModal({ showModal: WALLET_MODAL.WITHDRAWAL_BY_CARD }));
    } else {
      dispatch(setShowModal({ showModal: WALLET_MODAL.CONCLUSION }));
    }
  };

  const getTelegramAssetsCount = useCallback((): number => {
    if (!withdrawMethods?.telegram) return 0;

    return withdrawMethods.telegram.reduce((acc, method) => acc + method.assets.length, 0);
  }, [withdrawMethods]);

  const getDisplayedTelegramAssets = useCallback(() => {
    if (!withdrawMethods?.telegram) return [];

    const allAssets = withdrawMethods.telegram.flatMap(m => m.assets);

    if (telegramIsShow) {
      return allAssets;
    }

    return allAssets.slice(0, SLICE_QUANTITY);
  }, [withdrawMethods, telegramIsShow]);

  const cryptoData = cryptoIsShow ? withdrawMethods?.crypto : withdrawMethods?.crypto.slice(0, SLICE_QUANTITY);
  const fiatData = fiatIsShow ? withdrawMethods?.fiat : withdrawMethods?.fiat.slice(0, SLICE_QUANTITY);
  const telegramAssetsCount = getTelegramAssetsCount();
  const displayedTelegramAssets = getDisplayedTelegramAssets();

  useEffect(() => {
    if (withdrawMethods?.fiat && withdrawMethods.fiat.length < QUANTITY_PROPS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiatIsShow(true);
    }
    if (withdrawMethods?.crypto && withdrawMethods.crypto.length < QUANTITY_PROPS) {
      setCryptoIsShow(true);
    }

    if (withdrawMethods?.telegram && getTelegramAssetsCount() < QUANTITY_PROPS) {
      setTelegramIsShow(true);
    }
  }, [withdrawMethods, getTelegramAssetsCount]);

  return (
    <div className={styles.deposit}>
      <BannerSlider />

      <div className={styles.method}>
        {withdrawMethods?.fiat.length !== 0 && (
          <>
            <h3 className={styles.title}>{t('methods.banking')}</h3>
            <div className={clsx(styles.grid, styles.fiatGrid)}>
              {isLoading || !fiatData ? (
                <>
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </>
              ) : (
                <>
                  {fiatData.map(m => (
                    <MethodCard
                      key={`fiat-${m.code}`}
                      title={m.title}
                      currency={m.currency}
                      min={m.min}
                      media={m.media}
                      isBanking
                      onClick={() => {
                        onClickHandler(m);
                      }}
                    />
                  ))}
                  <MoreMethods
                    quantity={withdrawMethods!.fiat.length}
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
        {withdrawMethods?.telegram.length !== 0 && (
          <>
            <h3 className={styles.title}>{t('methods.telegramCrypto')}</h3>
            <div className={styles.grid}>
              {isLoading || !withdrawMethods?.telegram ? (
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
                        key={`telegram-${asset.code}-${index}`}
                        title={asset.title}
                        currency={asset.currency}
                        min={asset.min}
                        network={asset.network}
                        media={asset.media}
                        onClick={() => {
                          dispatch(setSelectedWithdrawMethod({ method: asset }));
                          dispatch(setShowModal({ showModal: WALLET_MODAL.WITHDRAWAL_BY_TELEGRAM_CURRENCY }));
                        }}
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
        {withdrawMethods?.crypto.length !== 0 && (
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
                  {cryptoData.map(m => (
                    <MethodCard
                      key={`crypto-${m.code}`}
                      title={m.title}
                      currency={m.currency}
                      network={m.network}
                      media={m.media}
                      min={m.min}
                      onClick={() => {
                        dispatch(setSelectedWithdrawMethod({ method: m }));
                        dispatch(setShowModal({ showModal: WALLET_MODAL.WITHDRAWAL_BY_CRYPTOCURRENCY }));
                      }}
                    />
                  ))}
                  <MoreMethods
                    quantity={withdrawMethods!.crypto.length}
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
