import { FC, useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent } from 'react';

import s from './ToggleSwitcher.module.scss';

type ToggleSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onToggle'> & {
  isOn?: boolean;
  defaultOn?: boolean;
  onToggle?: (nextValue: boolean) => void;
  size?: 'sm' | 'md';
};

export const ToggleSwitch: FC<ToggleSwitchProps> = ({
  isOn,
  defaultOn = false,
  onToggle,
  size = 'md',
  disabled,
  className,
  ...rest
}) => {
  const isControlled = typeof isOn === 'boolean';
  const [internalOn, setInternalOn] = useState<boolean>(isOn ?? defaultOn);

  useEffect(() => {
    if (typeof isOn === 'boolean') {
      // setInternalOn(isOn);
    }
  }, [isOn]);

  const currentOn = isControlled ? (isOn as boolean) : internalOn;

  const stateClassName = currentOn ? s.on : s.off;
  const sizeClassName = s[size];
  const disabledClassName = disabled ? s.disabled : '';

  const rootClassName = [s.toggle, stateClassName, sizeClassName, disabledClassName, className ?? '']
    .filter(Boolean)
    .join(' ');

  const handleClick = (): void => {
    if (disabled) return;

    const next = !currentOn;

    if (!isControlled) {
      setInternalOn(next);
    }

    if (onToggle) onToggle(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const next = !currentOn;

      if (!isControlled) {
        setInternalOn(next);
      }

      if (onToggle) onToggle(next);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-disabled={disabled}
      className={rootClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span className={s.thumb} />
    </button>
  );
};
