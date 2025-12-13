import styles from './BalanceCard.module.scss'
import {Button} from "@shared/ui";
import {WalletIcon} from "@shared/ui/icons";

export const BalanceCard = () => {
    return <div className = {styles.balanceCard}>
        <p className = {styles.balanceValue}>10 005 ₽</p>
        <Button className={styles.btn} icon={<div className={styles.btnIcon}><WalletIcon/></div>}>
        <span className={styles.btnText}>Пополнить</span>
        </Button>
    </div>
}
