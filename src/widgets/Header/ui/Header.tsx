import { Logo } from "@shared/ui/Logo";
import { Button } from "@shared/ui/button";
import { ReactComponent as WalletIcon } from "@assets/icons/wallet.svg";
import { AppAvatar } from "@widgets/Avatar/ui/Avatar";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import "../Header.scss";
import { useEffect, useState } from "react";

export const Header = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 800);
  const balance = "10 005,84 ₽";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <Logo />
      <div className="header-wrapper">
        <div className="header-balance">
          <div className="current-balance">{balance}</div>
          <Button icon={WalletIcon} square={isMobile}>
            Пополнить
          </Button>
        </div>
        <div className="avatar-container">
          <AppAvatar />
          <Button
            style={{ padding: 0 }}
            variant="secondary"
            icon={ChevronRightIcon}
          />
        </div>
      </div>
    </header>
  );
};
