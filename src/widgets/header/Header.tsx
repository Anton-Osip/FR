import styles from './Header.module.scss'
import {BalanceCard} from "./BalanceCard/BalanceCard.tsx";
import {Avatar, Brand} from "@shared/ui";

export const Header = () => {
    return <header className = {styles.header}>
        <div className = {styles.container}>
            <Brand/>
            <div className = {styles.wrapper}>
                <BalanceCard/>
                <Avatar/>
            </div>
        </div>
    </header>
}
