import { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { BannerSlider } from '@shared/ui/BannerSlider/BannerSlider';

import { MethodCard } from '../../components/MethodCard';

import styles from './WithdrawContent.module.scss';

import { setSelectedWithdrawMethod, setShowModal, WALLET_MODAL } from '@features/wallet/model';
import type { FiatWithdrawMethod, WalletWithdrawMethodsResponse } from '@features/wallet/model/apiTypes';

interface WithdrawContentProps {
  withdrawMethods?: WalletWithdrawMethodsResponse;
  isLoading?: boolean;
}

export const WithdrawContent: FC<WithdrawContentProps> = ({ withdrawMethods, isLoading = false }) => {
  const { t } = useTranslation('walletModal');
  const dispatch = useDispatch();
  // const [currency, setCurrency] = useState<string>('rub');
  //
  // const isLoggedIn = useAppSelector(selectIsLoggedIn);
  //
  // const { data: balance } = useGetUserBalanceQuery(undefined, {
  //   skip: !isLoggedIn,
  // });
  //
  // const balanceNumber = Number(balance?.balance);
  // const formattedValue = Number.isNaN(balanceNumber) ? 0 : balanceNumber;
  // const currencySymbol = getCurrencySymbol(balance?.currency);

  const onClickHandler = (method: FiatWithdrawMethod): void => {
    dispatch(setSelectedWithdrawMethod({ method }));
    if (method.code === 'card_number') {
      dispatch(setShowModal({ showModal: WALLET_MODAL.WITHDRAWAL_BY_CARD }));
    } else {
      dispatch(setShowModal({ showModal: WALLET_MODAL.CONCLUSION }));
    }
  };

  return (
    <div className={styles.deposit}>
      <BannerSlider />

      {/*<DropdownWallet value={currency} onChange={setCurrency} balance={`${formattedValue} ${currencySymbol}`} />*/}

      <div className={styles.method}>
        <h3 className={styles.title}>{t('methods.banking')}</h3>
        <div className={styles.fiatGrid}>
          {isLoading || !withdrawMethods?.fiat ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            withdrawMethods.fiat.map(m => (
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
            ))
          )}
        </div>
      </div>

      <div className={styles.method}>
        <h3 className={styles.title}>{t('methods.crypto')}</h3>
        <div className={styles.cryptoGrid}>
          {isLoading || !withdrawMethods?.crypto ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            withdrawMethods.crypto.map(m => (
              <MethodCard
                key={`crypto-${m.code}`}
                title={m.title}
                currency={m.currency}
                min={m.min}
                network={m.network}
                media={m.media}
                onClick={() => {
                  dispatch(setSelectedWithdrawMethod({ method: m }));
                  dispatch(setShowModal({ showModal: WALLET_MODAL.WITHDRAWAL_BY_CRYPTOCURRENCY }));
                }}
              />
            ))
          )}
          {isLoading || !withdrawMethods?.telegram ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : (
            withdrawMethods.telegram.flatMap(m =>
              m.assets.map(asset => (
                <MethodCard
                  key={`telegram-${m.code}-${asset.code}`}
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
              )),
            )
          )}
        </div>
      </div>
    </div>
  );
};
