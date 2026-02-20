import { FC, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { selectIsLoggedIn } from '@app/store';

import { useAppDispatch, useAppSelector } from '@shared/api';
import { type Tab, Tabs } from '@shared/ui';

import styles from './WalletModalContent.module.scss';

import { useGetWalletDepositMethodsQuery, useGetWalletWithdrawMethodsQuery } from '@features/wallet';
import { getTabIcon, isValidTab, selectActiveTab, setActiveTab, TABS_CONFIG_BASE } from '@features/wallet/model';
import { DepositContent } from '@features/wallet/ui/Deposit/DepositContent';
import { WithdrawContent } from '@features/wallet/ui/Withdrawal/WithdrawContent';

interface WalletModalContentProps {
  isOpen: boolean;
}

export const WalletModalContent: FC<WalletModalContentProps> = ({ isOpen }) => {
  const { t } = useTranslation('walletModal');
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const { data: depositMethods, isLoading: depositMethodsIsLoading } = useGetWalletDepositMethodsQuery(undefined, {
    skip: !isLoggedIn || !isOpen,
  });
  const { data: withdrawMethods, isLoading: withdrawMethodsIsLoading } = useGetWalletWithdrawMethodsQuery(undefined, {
    skip: !isLoggedIn || !isOpen,
  });

  const tabs: Tab[] = useMemo(
    () =>
      TABS_CONFIG_BASE.map(tab => ({
        ...tab,
        label: t(tab.labelKey),
        icon: getTabIcon(tab.value),
        active: tab.value === activeTab,
      })),
    [activeTab, t],
  );

  const handleTabChange = useCallback(
    (value: string): void => {
      if (isValidTab(value)) {
        dispatch(setActiveTab({ activeTab: value }));
      }
    },
    [dispatch],
  );

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs items={tabs} onChange={handleTabChange} className={styles.tabs} />
      </div>

      {activeTab === 'deposit' && (
        <DepositContent depositMethods={depositMethods} isLoading={depositMethodsIsLoading} />
      )}

      {activeTab === 'withdraw' && (
        <WithdrawContent withdrawMethods={withdrawMethods} isLoading={withdrawMethodsIsLoading} />
      )}
    </>
  );
};
