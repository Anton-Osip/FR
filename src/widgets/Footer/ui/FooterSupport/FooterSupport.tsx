import {Button} from "@shared/ui/button";
import type {FC} from "react";
import styles from "./FooterSupport.module.scss";
import {SupportIcon} from "@shared/ui/icons";


interface Props {
    className?: string;
}

export const FooterSupport: FC<Props> = ({className}) => {
    return (
        <div className={`${styles["footer-support"]} ${
            className ? styles[className] : ""
        }`}>
            <h3>
                Тех. поддержка <span className={styles["footer-support-time"]}>24/7</span>
            </h3>
            <Button size="s" icon={<SupportIcon/>} variant="secondary">
                Написать
            </Button>
        </div>
    );
};
