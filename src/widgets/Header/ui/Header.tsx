import { Logo } from "@shared/ui/Logo";
import { Button } from "@shared/ui/button";
import { ReactComponent as WalletIcon } from "@assets/icons/wallet.svg";
import { AppAvatar } from "@widgets/Avatar/ui/Avatar";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import "../Header.scss";

export const Header = () => {
  const balance = "10 005,84 ₽";

  return (
    <header className="header">
      <Logo />
      <div className="header-wrapper">
        <div className="header-balance">
          <div className="current-balance">{balance}</div>
          <Button icon={WalletIcon}>Пополнить</Button>
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
