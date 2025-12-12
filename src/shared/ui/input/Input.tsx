import type { FC, ReactNode } from "react";
// import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./Input.scss";

interface InputProps {
  type: string;
  placeholder: string;
  onChange: () => void;
  icon?: ReactNode;
}

export const Input: FC<InputProps> = ({
  type,
  placeholder,
  icon,
  onChange,
}) => {
  return (
    <div className="inputWrapper">
      {icon && <span className="inputIcon">{icon}</span>}
      <input
        onChange={onChange}
        className="input"
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
};
