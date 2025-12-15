import {
  forwardRef,
  type ButtonHTMLAttributes,
  type FC,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  type SVGProps,
} from "react";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import styles from "./Button.module.scss";

type IconType =
  | FC<SVGProps<SVGSVGElement>>
  | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    icon?: ReactNode |IconType;
    variant?: "primary" | "secondary" | "ghost";
    size?: "s" | "m";
    fullWidth?: boolean;
    active?: boolean;
    square?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon: Icon,
      variant = "primary",
      size = "m",
      fullWidth = false,
      active = false,
      square = false,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const mergedClassName = [
      styles.button,
      styles[`button-${variant}`],
      styles[`button-size-${size}`],
      fullWidth ? styles["button-full"] : "",
      active ? styles["is-active"] : "",
      square ? styles["button-square"] : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={mergedClassName} type={type} {...props}>
        {Icon && <Icon className={styles.buttonIcon} />}
        {children && <span className={styles.buttonText}>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
