import styles from './AmountCard.module.scss'
import {type FC} from "react";

interface RewardsCardProps {
    className?: string
    description: string
    amount: string
}

export const AmountCard: FC<RewardsCardProps> = ({className, amount, description}) => {

    return (
        <div className={`${styles.amountCard} ${className ?? ''}`}>
            <h3 className={styles.amount}>{amount}</h3>
            <p className={styles.description}>{description}</p>
        </div>
    )
}