import { APP_NAME, APP_PATH } from "@shared/constants/constants";
import { ReactComponent as LogoIcon } from "@assets/icons/logo.svg";
import { useNavigate } from "react-router-dom";
import type { FC } from "react";
import "./Logo.scss";

interface Props {
  className?: string;
}

export const Logo: FC<Props> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(APP_PATH.main);
  };

  return (
    <div className={`logo ${className ?? ""}`} onClick={handleClick}>
      <LogoIcon className="logo-icon" />
      <h1 className="logo-header">{APP_NAME}</h1>
    </div>
  );
};
