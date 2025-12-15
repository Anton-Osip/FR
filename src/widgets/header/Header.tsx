import styles from './Header.module.scss'
import {BalanceCard} from "./BalanceCard/BalanceCard";
import {Avatar, Brand} from "@shared/ui";
import type {FC} from "react";

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
            </div>
        </div>
    </header>
}