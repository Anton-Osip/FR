import styles from './MenuItem.module.scss'
import type {FC, ReactNode} from "react";

interface MenuItemProps {
    icon: ReactNode
    label: string
    isActive: boolean
    isOpen: boolean
}

export const MenuItem: FC<MenuItemProps> = ({label, icon, isActive, isOpen}) => {
    return (
        <button className = {`${styles.item} ${isActive && styles.isActive} ${!isOpen ? styles.unVisible : ''}`}>
            <div className = {styles.iconWrapper}>
                {icon}
            </div>
            <span className = {styles.label}>{label}</span>
        </button>
    )
}
