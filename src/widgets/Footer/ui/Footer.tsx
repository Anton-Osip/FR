import { Logo } from "@shared/ui/Logo";
import {
  APP_RIGHTS,
  FOOTER_LTD_TEXT,
  FOOTER_MENU,
} from "@shared/constants/constants";
import { Separator } from "radix-ui";
import { Button } from "@shared/ui/button";
import { ReactComponent as TgIcon } from "@assets/icons/tg.svg";
import { FooterMenu } from "./FooterMenu";
import { FooterSupport } from "./FooterSupport";
import { FooterMoneyItem } from "./FooterMoneyItem";
import "../Footer.scss";

export const Footer = () => {
  const banks = [
    { id: "1", img: "" },
    { id: "3", img: "" },
    { id: "4", img: "" },
  ];

  return (
    <footer className="footer">
      <div className="footer-grid">
        <Logo className="footer-logo" />
        <p className="footer-rights">{APP_RIGHTS}</p>
        <Button
          className="footer-telegram"
          icon={(props: React.SVGProps<SVGSVGElement>) => (
            <TgIcon {...props} style={{ color: "#1873f2" }} />
          )}
          size="s"
          variant="secondary"
        >
          Телеграм-канал
        </Button>
        <Separator.Root className="separator separator-menu" />
        <FooterMenu className="footer-menu" items={FOOTER_MENU} />
        <FooterSupport className="footer-support" />
        <Separator.Root className="separator separator-money" />
        <div className="footer-money">
          <FooterMoneyItem text="Банкинг" items={banks} />
          <FooterMoneyItem text="Крипто" items={banks} />
        </div>
        <Separator.Root className="separator separator-support" />
        <p className="footer-ltd-text">{FOOTER_LTD_TEXT}</p>
      </div>
    </footer>
  );
};
