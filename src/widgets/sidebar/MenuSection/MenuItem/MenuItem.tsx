import styles from './MenuItem.module.scss'
import type {FC, ReactNode} from "react";

interface MenuItemProps {
    icon: ReactNode
    label: string
    isActive: boolean
}

export const MenuItem: FC<MenuItemProps> = ({label, icon,isActive}) => {
    return (
        <button className = {`${styles.item} ${isActive && styles.isActive}`}>
            <div className = {styles.iconWrapper}>
                {icon}
            </div>
            <span className = {styles.label}>{label}</span>
        </button>
    )
}
