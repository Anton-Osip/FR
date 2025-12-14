import { Logo } from "@shared/ui/Logo";
import {
  FOOTER_RIGHTS,
  FOOTER_LTD_TEXT,
  FOOTER_MENU,
  FOOTER_BANKING,
  FOOTER_CRYPTO,
} from "../constants/constants";
import { Separator } from "radix-ui";
import { Button } from "@shared/ui/button";
import { ReactComponent as TgIcon } from "@assets/icons/tg.svg";
import { FooterMenu } from "./FooterMenu";
import { FooterSupport } from "./FooterSupport";
import { FooterMoneyItem } from "./FooterMoneyItem";
import "../Footer.scss";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <Logo className="footer-logo" />
        <p className="footer-rights">{FOOTER_RIGHTS}</p>
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
          <FooterMoneyItem text="Банкинг" items={FOOTER_BANKING} />
          <FooterMoneyItem text="Крипто" items={FOOTER_CRYPTO} />
        </div>
        <Separator.Root className="separator separator-support" />
        <p className="footer-ltd-text">{FOOTER_LTD_TEXT}</p>
      </div>
    </footer>
  );
};
