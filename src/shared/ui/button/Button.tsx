import { type FC, type ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

export const Button: FC<ButtonProps> = ({
  children,
  icon,
  variant = "primary",
  ...props
}) => {
  return (
    <button className={`button button-${variant}`} {...props}>
      {icon && <span className="buttonIcon">{icon}</span>}
      {children}
    </button>
  );
};
