import { type ReactNode, FC, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { DropdownApp } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp';
import { OkIcon } from '@shared/ui/icons';

import styles from './BankSelector.module.scss';

import { useGetWalletWithdrawBanksQuery } from '@features/wallet/api/walletApi';
import type { Media } from '@features/wallet/model';

interface BankIconProps {
  media: Media | null;
  className?: string;
}

const BankIcon: FC<BankIconProps> = ({ media, className }) => {
  if (!media || media.type !== 'image') {
    return null;
  }

  return <img src={media.url} alt="" className={className} />;
};

interface BankSelectorProps {
  method: string;
  amount: number;
  value?: string;
  onChange?: (bankId: string) => void;
  className?: string;
}

export const BankSelector: FC<BankSelectorProps> = ({ method, amount, value, onChange, className }) => {
  const { data: banksData, isLoading } = useGetWalletWithdrawBanksQuery({ method, amount });
  const hasInitializedRef = useRef(false);

  const bankItems: DropdownMenuItems[] = useMemo(() => {
    if (!banksData?.banks) {
      return [];
    }

    return banksData.banks.map(bank => ({
      id: bank.code,
      title: bank.title,
      icon: ({ className: iconClassName }: { className?: string }) => (
        <BankIcon media={bank.icon} className={iconClassName} />
      ),
    }));
  }, [banksData]);

  const defaultValue = useMemo(() => {
    return bankItems.length > 0 ? bankItems[0].id : '';
  }, [bankItems]);

  const [internalValue, setInternalValue] = useState<string>(() => defaultValue);

  useLayoutEffect(() => {
    if (bankItems.length > 0 && !hasInitializedRef.current && defaultValue) {
      const shouldAutoSelect = value === undefined || value === '';

      if (shouldAutoSelect) {
        hasInitializedRef.current = true;
        queueMicrotask(() => {
          onChange?.(defaultValue);
        });
      }
    }
  }, [bankItems.length, value, defaultValue, onChange]);

  const handleChange = (item: DropdownMenuItems): void => {
    const bankId = item.id;

    if (value === undefined) {
      setInternalValue(bankId);
    }
    onChange?.(bankId);
  };

  const currentValue = useMemo(() => {
    if (value !== undefined) {
      return value;
    }

    return internalValue || defaultValue;
  }, [value, internalValue, defaultValue]);

  const selectedBank = useMemo(() => {
    return bankItems.find(item => item.id === currentValue) ?? bankItems[0];
  }, [bankItems, currentValue]);

  const renderBankItem = (item: DropdownMenuItems, onSelect: () => void): ReactNode => {
    const isActive = item.id === currentValue;
    const Icon = item.icon;

    return (
      <button type="button" onClick={onSelect} className={styles.item}>
        <span className={styles.itemContent}>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          <span className={styles.bankName}>{item.title}</span>
        </span>
        {isActive && <OkIcon className={styles.okIcon} />}
      </button>
    );
  };

  const bankTrigger = useMemo((): ReactNode => {
    const Icon = selectedBank?.icon;

    return (
      <button type="button" className={styles.currencyTrigger}>
        <span className={styles.title}>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          {selectedBank?.title ?? '—'}
        </span>

        <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9.77223 4.29621L7.47863 2.19611L6.07817 0.907262C5.48512 0.364246 4.52051 0.364246 3.92746 0.907262L0.226255 4.29621C-0.259618 4.74109 0.0904962 5.5 0.769289 5.5H4.77774H9.2292C9.91514 5.5 10.2581 4.74109 9.77223 4.29621Z"
            fill="currentColor"
          />
          <path
            d="M9.22726 13.5H4.77747H0.770515C0.084833 13.5 -0.258008 14.2589 0.227684 14.7038L3.92751 18.0927C4.52034 18.6358 5.48458 18.6358 6.07741 18.0927L7.48449 16.8039L9.77724 14.7038C10.2558 14.2589 9.91295 13.5 9.22726 13.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
    );
  }, [selectedBank]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!bankItems.length) {
    return (
      <div className={className}>
        <div className={styles.empty}>Нет доступных банков</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownApp
        list={bankItems}
        value={currentValue}
        onChange={handleChange}
        itemsClassName={styles.dropdownItems}
        renderItem={renderBankItem}
        trigger={bankTrigger}
        triggerClassName={styles.dropdownTrigger}
      />
    </div>
  );
};
