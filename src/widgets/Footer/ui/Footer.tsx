import {
    FOOTER_RIGHTS,
    FOOTER_LTD_TEXT,
    FOOTER_MENU,
    FOOTER_BANKING,
    FOOTER_CRYPTO,
} from "../constants/constants";
import * as Separator from "@radix-ui/react-separator";
import {Button} from "@shared/ui/button";
import {FooterMenu} from "./FooterMenu";
import {FooterSupport} from "./FooterSupport";
import {FooterMoneyItem} from "./FooterMoneyItem";
import styles from "../Footer.module.scss";
import type {FC} from "react";
import {Brand} from "@shared/ui";
import {TgIcon} from "@shared/ui/icons";

interface FooterProps {
    className?: string;
}

export const Footer: FC<FooterProps> = ({className}) => {

    return (
        <footer className={`${styles.footer} ${className ? className : ''}`}>
            <div className={styles.footerGrid}>
                <Brand className={styles.logo}/>
                  <p className={styles.footerRight}>{FOOTER_RIGHTS}</p>
                  <Button
                    className={styles.footerTelegram}
                    icon={<TgIcon/>}
                    size="s"
                    variant="secondary"
                  >
                    Телеграм-канал
                  </Button>
                  <Separator.Root
                    className={`${styles.separator} ${styles.separatorMenu}`}
                  />
                  <FooterMenu className={styles.footerMenu} items={FOOTER_MENU} />
                  <FooterSupport className={styles.footerSupport} />
                  <Separator.Root
                    className={`${styles.separator} ${styles.separatorMoney}`}
                  />
                  <div className={styles.footerMoney}>
                    <FooterMoneyItem text="Банкинг" items={FOOTER_BANKING} />
                    <FooterMoneyItem text="Крипто" items={FOOTER_CRYPTO} />
                  </div>
                  <Separator.Root
                    className={`${styles.separator} ${styles.separatorSupport}`}
                  />
                  <p className={styles.footerLtdText}>{FOOTER_LTD_TEXT}</p>
            </div>
        </footer>
    );
};
