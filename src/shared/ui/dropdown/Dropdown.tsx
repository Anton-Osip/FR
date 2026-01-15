import { type ElementType, KeyboardEvent, type ReactNode, useMemo, useState } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { DropdownItem } from '@shared/ui/dropdown/DropdownItem.tsx';
import { ChevronHorizontal } from '@shared/ui/icons';

import s from './Dropdown.module.scss';

export type DropdownMenuItems = {
  href?: string;
  icon?: ElementType;
  id: string;
  onClick?: () => void;
  title: string;
};

type Props<T extends DropdownMenuItems> = {
  list: T[];
  renderItem?: (item: T, onSelect: () => void, index?: number) => ReactNode;
  trigger?: ReactNode;
  value?: string;
  onChange?: (item: T) => void;
  itemsClassName?: string;
  triggerClassName?: string;
};

export const Dropdown = <T extends DropdownMenuItems>(props: Props<T>): ReactNode => {
  const { list, renderItem, trigger, value, onChange, itemsClassName, triggerClassName } = props;
  const [open, setOpen] = useState(false);

  const selectedItem = useMemo(() => {
    if (value) {
      return list.find(item => item.id === value || item.title === value);
    }

    return list[0];
  }, [value, list]);

  const [selectedTitle, setSelectedTitle] = useState<string>(
    value ? (selectedItem?.title ?? list[0]?.title ?? 'Выбрано') : (list[0]?.title ?? 'Выбрано'),
  );

  const displayTitle = value ? (selectedItem?.title ?? 'Выбрано') : selectedTitle;

  const handleOpenChange = (): void => {
    setOpen(!open);
  };

  const triggerRootClassName = clsx(s.trigger, triggerClassName, { [s.iconActive]: open });
  const contentClassName = clsx(s.content, itemsClassName);

  const dropDownMenuItems = list.map((item: T) => {
    const handleSelect = (): void => {
      if (!value) {
        setSelectedTitle(item.title);
      }

      if (onChange) {
        onChange(item);
      }

      if ('onClick' in item && typeof item.onClick === 'function') {
        item.onClick();
      } else if ('href' in item && typeof item.href === 'string') {
        window.location.href = item.href;
      }

      setOpen(false);
    };

    const onKeyDownHandler = (e: KeyboardEvent<HTMLDivElement>): void => {
      if (e.code === 'Enter') {
        handleSelect();
      }
    };

    return (
      <DropdownMenu.Item
        className={s.dropdownItem}
        key={item.id ?? item.title}
        onKeyDown={onKeyDownHandler}
        onSelect={handleSelect}
      >
        {renderItem ? (
          renderItem(item, handleSelect)
        ) : (
          <DropdownItem
            title={item.title}
            onSelect={handleSelect}
            active={value ? item.id === value || item.title === value : displayTitle === item.title}
          />
        )}
      </DropdownMenu.Item>
    );
  });

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenu.Trigger asChild className={triggerRootClassName}>
        {trigger ?? (
          <button type="button" aria-haspopup="listbox" aria-expanded={open}>
            <span className={s.label}>{displayTitle}</span>
            <span className={`${s.chevron} ${open ? s.chevronOpen : ''}`} aria-hidden="true">
              <ChevronHorizontal />
            </span>
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={'center'}
          className={contentClassName}
          side="bottom"
          sideOffset={5}
          avoidCollisions={false}
          style={{
            minWidth: 'var(--radix-dropdown-menu-trigger-width)',
            width: 'var(--radix-dropdown-menu-trigger-width)',
          }}
        >
          {dropDownMenuItems}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
