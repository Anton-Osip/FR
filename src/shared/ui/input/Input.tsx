import {
  forwardRef,
  type InputHTMLAttributes,
  FocusEvent,
  type ReactNode,
  type RefObject,
  useRef,
  useState,
  ChangeEvent,
  useEffect,
} from 'react';

import clsx from 'clsx';

import styles from './Input.module.scss';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: ReactNode;
  onIconClick?: () => void;
  size?: 's' | 'm';
  iconPosition?: 'start' | 'end';
  error?: boolean;
  label?: string;
  positionLabel?: 'top' | 'bottom' | 'left' | 'right';
  isGhost?: boolean;
  shakeKey?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      onIconClick,
      iconPosition = 'start',
      icon,
      className,
      label,
      positionLabel = 'top',
      size = 'm',
      error = false,
      isGhost = false,
      shakeKey,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showError, setShowError] = useState(error);

    const setRef = (node: HTMLInputElement | null): void => {
      innerRef.current = node;
      if (node) {
        setHasValue(!!node.value);
      }

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        (ref as RefObject<HTMLInputElement | null>).current = node;
      }
    };

    const focusInput = (): void => {
      if (props.disabled) return;
      innerRef.current?.focus();
    };

    const mergedClassName = clsx(
      styles.root,
      styles[`input-size-${size}`],
      showError && styles.error,
      label && styles[`with-label-${positionLabel}`],
      isGhost && styles.isGhost,
      className,
    );

    const handleIconClick = (): void => {
      focusInput();
      if (!onIconClick) return;
      onIconClick();
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
      setIsFocused(true);
      setHasValue(!!event.target.value);
      props.onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
      setIsFocused(false);
      setHasValue(!!event.target.value);
      props.onBlur?.(event);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      setHasValue(!!event.target.value);
      props.onChange?.(event);
    };

    // Перезапуск анимации тряски при изменении shakeKey через состояние
    useEffect(() => {
      if (shakeKey !== undefined && error) {
        // Временно убираем класс для перезапуска анимации
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowError(false);
        // Используем requestAnimationFrame для гарантии перерисовки
        requestAnimationFrame(() => {
          setShowError(true);
        });
      } else {
        setShowError(error);
      }
    }, [shakeKey, error]);

    return (
      <div className={mergedClassName} onClick={focusInput}>
        {label && (
          <span className={clsx(styles.label, (isFocused || hasValue) && styles[`label-${positionLabel}`])}>
            {label}
          </span>
        )}

        {icon && iconPosition === 'start' && (
          <span onClick={handleIconClick} className={styles.icon}>
            {icon}
          </span>
        )}
        <input
          {...props}
          ref={setRef}
          className={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {icon && iconPosition === 'end' && (
          <span onClick={handleIconClick} className={styles.icon}>
            {icon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
