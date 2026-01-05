import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import clsx from 'clsx';

import styles from './Input.module.scss';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: ReactNode;
  size?: 's' | 'm';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ icon, className, size = 'm', ...props }, ref) => {
  const mergedClassName = clsx(styles.root, styles[`input-size-${size}`], className);

  return (
    <div className={mergedClassName}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input ref={ref} className={styles.input} {...props} />
    </div>
  );
});

Input.displayName = 'Input';
