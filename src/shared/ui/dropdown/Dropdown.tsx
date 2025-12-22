import { type FC, useEffect, useRef, useState } from 'react';

import { ChevronHorizontal } from '@shared/ui/icons';

import s from './Dropdown.module.scss';

type Option = {
  label: string;
  value: string;
  number?: number;
};

type DropdownProps = {
  options: Option[];
  value: string | string[];
  onChange: (option: Option | Option[]) => void;
  variant?: 'default' | 'hover';
  width?: number | string;
  height?: number | string;
  className?: string;
  scrollable?: boolean;
  multiple?: boolean;
};

const DEFAULT_DROPDOWN_HEIGHT = 39;

export const Dropdown: FC<DropdownProps> = ({
  options,
  value,
  onChange,
  variant = 'default',
  height = DEFAULT_DROPDOWN_HEIGHT,
  className,
  scrollable = false,
  multiple = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMultiple = multiple;
  const selectedValues = isMultiple ? (Array.isArray(value) ? value : []) : [];
  const selectedValue = isMultiple ? '' : typeof value === 'string' ? value : '';

  const selectedOption = isMultiple ? null : options.find(option => option.value === selectedValue) || options[0];

  const getDisplayLabel = (): string => {
    if (isMultiple) {
      return 'Провайдеры';
    }

    return selectedOption?.label || '';
  };

  const wrapperClassName = `${s.wrapper} ${s[variant]} ${className || ''}`.trim();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: Option): void => {
    if (isMultiple) {
      let newValues: string[];

      // Если кликнули на "all" (первая опция обычно "all")
      if (option.value === options[0]?.value && options[0]?.value === 'all') {
        if (selectedValues.includes('all')) {
          // Снимаем выбор с "all"
          newValues = [];
        } else {
          // Выбираем только "all"
          newValues = ['all'];
        }
      } else {
        // Если выбрана опция не "all"
        if (selectedValues.includes('all')) {
          // Если был выбран "all", заменяем его на выбранную опцию
          newValues = [option.value];
        } else {
          // Обычная логика множественного выбора
          newValues = selectedValues.includes(option.value)
            ? selectedValues.filter(v => v !== option.value)
            : [...selectedValues, option.value];
        }
      }

      const selectedOptions = options.filter(opt => newValues.includes(opt.value));

      onChange(selectedOptions);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={wrapperClassName}
      style={{
        height: containerHeight,
      }}
      ref={dropdownRef}
    >
      <button
        className={s.trigger}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ height: containerHeight }}
      >
        <span className={s.label}>{getDisplayLabel()}</span>
        <span className={`${s.chevron} ${isOpen ? s.chevronOpen : ''}`} aria-hidden="true">
          <ChevronHorizontal />
        </span>
      </button>

      <div
        className={`${s.listWrapper} ${isOpen ? s.open : ''} ${scrollable ? s.listScrollable : ''}`.trim()}
        role="listbox"
      >
        <ul className={`${s.list} ${scrollable ? s.listScrollable : ''}`.trim()}>
          {options.map(option => {
            const isActive = isMultiple ? selectedValues.includes(option.value) : option.value === selectedValue;

            return (
              <li key={option.value} role="option">
                <button
                  className={`${s.option} ${isActive ? s.optionActive : ''}`}
                  onClick={() => handleOptionClick(option)}
                  type="button"
                  aria-selected={isActive}
                >
                  <span className={s.optionContent}>
                    <span className={s.optionRadio} aria-hidden="true" />
                    <span className={s.optionLabel}>{option.label}</span>
                    {option.number && <div className={s.optionNumber}>{option.number}</div>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
