import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type FC,
  type ForwardRefExoticComponent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  type SVGProps,
} from 'react';

import type { IconProps } from '@radix-ui/react-icons/dist/types';
import clsx from 'clsx';

import styles from './Button.module.scss';

type IconType = FC<SVGProps<SVGSVGElement>> | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

type ButtonOwnProps = {
  children?: ReactNode;
  icon?: ReactNode | IconType;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'accent';
  size?: 's' | 'm';
  fullWidth?: boolean;
  active?: boolean;
  square?: boolean;
};

type PolymorphicComponentPropsWithRef<T extends ElementType, Props = object> = {
  as?: T;
  ref?: Ref<unknown>;
} & Props &
  Omit<ComponentPropsWithoutRef<T>, keyof Props | 'as' | 'ref'>;

export type ButtonProps<T extends ElementType = 'button'> = PolymorphicComponentPropsWithRef<T, ButtonOwnProps>;

type ButtonComponent = <T extends ElementType = 'button'>(props: ButtonProps<T>) => ReactElement;

export const Button = forwardRef(
  (
    {
      as,
      children,
      icon: Icon,
      variant = 'primary',
      size = 'm',
      fullWidth = false,
      active = false,
      square = false,
      className,
      ...props
    }: ButtonProps<ElementType>,
    ref: Ref<unknown>,
  ): ReactElement => {
    const Component = (as || 'button') as ElementType;

    const mergedClassName = clsx(
      styles.button,
      styles[`button-${variant}`],
      styles[`button-size-${size}`],
      fullWidth && styles['button-full'],
      active && styles['is-active'],
      square && styles['button-square'],
      className,
    );

    const renderIcon = (): ReactNode => {
      if (!Icon) return null;

      if (typeof Icon === 'function' || (typeof Icon === 'object' && 'render' in Icon)) {
        const IconComponent = Icon as IconType;

        return <IconComponent className={styles.buttonIcon} />;
      }

      return <span className={styles.buttonIcon}>{Icon}</span>;
    };

    return (
      <Component ref={ref} className={mergedClassName} {...(Component === 'button' && { type: 'button' })} {...props}>
        {renderIcon()}
        {children && <span className={styles.buttonText}>{children}</span>}
      </Component>
    );
  },
) as ButtonComponent & { displayName?: string };

Button.displayName = 'Button';
