import styles from './ProgramTerms.module.scss'
import type {FC} from "react";
import {CalendarIcon, GraphIcon, PercentageCircleIcon, WalletIcon} from "@shared/ui/icons";

interface ProgramTermsProps {
    className?: string
}

const CARDS_DATA = [
    {
        id: 1,
        title: "Первый депозит",
        description: "Получите 50% до 500 ₽ за первый депозит",
        icon: <WalletIcon/>
    },
    {
        id: 2,
        title: "GGR-бонус",
        description: "Получайте процент\nот игрового оборота",
        icon: <GraphIcon/>
    },
    {
        id: 3,
        title: "15% от прибыли",
        description: "Фиксированный процент от  дохода рефералов",
        icon: <PercentageCircleIcon/>
    },
    {
        id: 4,
        title: "Недельные выплаты",
        description: "Заберите награду за инвайты в конце недели",
        icon: <CalendarIcon/>
    }
]

export const ProgramTerms: FC<ProgramTermsProps> = ({className}) => {
    return <div className={`${styles.programTerms} ${className ?? ''}`}>
        <h2 className={styles.title}>
            Условия программы
        </h2>
        <div className={styles.grid}>
            {CARDS_DATA.map(card => (
                <div key={card.id} className={styles.card}>
                    <div className={styles.image}>
                        {card.icon}
                    </div>
                    <h4 className={styles.cardTitle}>{card.title}</h4>
                    <p className={styles.description}>{card.description}</p>
                </div>
            ))}
        </div>
    </div>
}