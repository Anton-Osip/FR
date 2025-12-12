import { Logo } from "@shared/ui/Logo";
import { Button } from "@shared/ui/button";
import { ReactComponent as WalletIcon } from "@assets/icons/wallet.svg";
import "../Header.scss";

export const Header = () => {
  const balance = "10 005,84 ₽";

  return (
    <header className="header">
      <Logo />
      <div>
        <div className="header-balance">
          <div className="current-balance">{balance}</div>
          <Button icon={WalletIcon}>Пополнить</Button>
        </div>
      </div>
    </header>
  );
};
