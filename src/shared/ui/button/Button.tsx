import { type ButtonHTMLAttributes, type FC, type ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  size?: "s" | "m";
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  icon,
  variant = "primary",
  size = "m",
  fullWidth = false,
  className,
  ...props
}) => {
  const mergedClassName = [
    "button",
    `button-${variant}`,
    `button-size-${size}`,
    fullWidth ? "button-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={mergedClassName} {...props}>
      {icon && <span className="buttonIcon">{icon}</span>}
      {children}
    </button>
  );
};
