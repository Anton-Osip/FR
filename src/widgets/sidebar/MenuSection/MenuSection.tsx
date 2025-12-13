import type {FC, ReactNode} from "react";
import {MenuItem} from "./MenuItem/MenuItem.tsx";
import styles from './MenuSection.module.scss'

interface MenuSectionProps {
    list: MenuItems[]
    title: string
    isOpen: boolean
}

interface MenuItems {
    id: string
    icon: ReactNode
    label: string
    isActive: boolean
}

export const MenuSection: FC<MenuSectionProps> = ({list, title, isOpen}) => {
    return (<div className = {styles.menuSection}>
        <h3 className = {`${styles.title} ${!isOpen ? styles.hidden : ''}`}>{title}</h3>
        {list.map(item => (
            <MenuItem
                key = {item.id}
                icon = {item.icon}
                label = {item.label}
                isActive = {item.isActive}
                isOpen={isOpen}
            />
        ))}
    </div>)

}
