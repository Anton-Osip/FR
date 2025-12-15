import { Logo } from "@shared/ui/Logo";
import {
  FOOTER_RIGHTS,
  FOOTER_LTD_TEXT,
  FOOTER_MENU,
  FOOTER_BANKING,
  FOOTER_CRYPTO,
} from "../constants/constants";
import * as Separator from "@radix-ui/react-separator";
import { Button } from "@shared/ui/button";
import { ReactComponent as TgIcon } from "@assets/icons/tg.svg";
import { FooterMenu } from "./FooterMenu";
import { FooterSupport } from "./FooterSupport";
import { FooterMoneyItem } from "./FooterMoneyItem";
import styles from "../Footer.module.scss";

export const Footer = () => {
  return (
    <footer className={styles["footer"]}>
      <div className={styles["footer-grid"]}>
        <Logo className={styles["footer-logo"]} />
        <p className={styles["footer-rights"]}>{FOOTER_RIGHTS}</p>
        <Button
          className={styles["footer-telegram"]}
          icon={() => <TgIcon className={styles["footer-telegram-gradient"]} />}
          size="s"
          variant="secondary"
        >
          Телеграм-канал
        </Button>
        <Separator.Root
          className={`${styles.separator} ${styles["separator-menu"]}`}
        />
        <FooterMenu className={styles["footer-menu"]} items={FOOTER_MENU} />
        <FooterSupport className={styles["footer-support"]} />
        <Separator.Root
          className={`${styles.separator} ${styles["separator-money"]}`}
        />
        <div className={styles["footer-money"]}>
          <FooterMoneyItem text="Банкинг" items={FOOTER_BANKING} />
          <FooterMoneyItem text="Крипто" items={FOOTER_CRYPTO} />
        </div>
        <Separator.Root
          className={`${styles.separator} ${styles["separator-support"]}`}
        />
        <p className={styles["footer-ltd-text"]}>{FOOTER_LTD_TEXT}</p>
      </div>
    </footer>
  );
};
