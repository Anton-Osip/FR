import styles from './Header.module.scss'
import {BalanceCard} from "./BalanceCard/BalanceCard";
import {Avatar, Brand, Button} from "@shared/ui";
import type {FC} from "react";
import {ChevronHeaderIcon} from "@shared/ui/icons";

interface HeaderProps {
    className?: string;
}

export const Header: FC<HeaderProps> = ({className}) => {
    return <header className = {`${styles.header} ${className || ''}`}>
        <div className = {styles.container}>
            <Brand/>
            <div className = {styles.wrapper}>
                <BalanceCard/>
                <Avatar/>
                <Button variant={'ghost'} className={styles.chevronHeader}>
                    <ChevronHeaderIcon/>
                </Button>
            </div>
        </div>
    </header>
}