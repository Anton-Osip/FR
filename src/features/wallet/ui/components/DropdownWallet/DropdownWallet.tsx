import { type ReactNode, FC, useMemo, useState } from 'react';

import clsx from 'clsx';

import { DropdownApp } from '@shared/ui';
import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp';
import { OkIcon } from '@shared/ui/icons';

import styles from './DropdownWallet.module.scss';

interface DropdownWalletProps {
  items: DropdownMenuItems[];
  value?: string;
  onChange?: (currencyId: string) => void;
  className?: string;
}

export const DropdownWallet: FC<DropdownWalletProps> = ({ items, value: controlledValue, onChange, className }) => {
  const [internalValue, setInternalValue] = useState<string>(items[0]?.id ?? 'rub');

  const currency = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (itemId: string): void => {
    if (controlledValue === undefined) {
      setInternalValue(itemId);
    }
    onChange?.(itemId);
  };

  const selectedCurrency = useMemo(() => items.find(item => item.id === currency) ?? items[0], [currency, items]);

  const renderCurrencyItem = (item: DropdownMenuItems, onSelect: () => void): ReactNode => {
    const isActive = item.id === currency;
    const Icon = item.icon;

    return (
      <button type="button" onClick={onSelect} className={styles.item}>
        <span className={styles.title}>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          {item.title}
        </span>
        {isActive && <OkIcon className={styles.okIcon} />}
      </button>
    );
  };

  const currencyTrigger = useMemo((): ReactNode => {
    const Icon = selectedCurrency?.icon;

    return (
      <button type="button" className={styles.currencyTrigger}>
        <span className={styles.title}>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          {selectedCurrency?.title ?? '—'}
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
  }, [selectedCurrency]);

  return (
    <div className={clsx(styles.root, className)}>
      <DropdownApp
        list={items}
        value={currency}
        onChange={item => handleChange(item.id)}
        itemsClassName={styles.dropdownItems}
        renderItem={renderCurrencyItem}
        trigger={currencyTrigger}
        triggerClassName={styles.dropdownTrigger}
      />
    </div>
  );
};
