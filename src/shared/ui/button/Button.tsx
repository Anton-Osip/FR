import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  size?: "s" | "m";
  fullWidth?: boolean;
  active?: boolean;
  square?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
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
        {icon && <span className={styles.buttonIcon}>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
