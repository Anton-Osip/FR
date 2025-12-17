import styles from './SidebarFooter.module.scss'
import type {FC} from "react";

interface SidebarFooterProps {
    isOpen:boolean
    className?:string
}

export const SidebarFooter:FC<SidebarFooterProps> = ({isOpen,className}) => {
    return <footer className = {`${styles.footer} ${!isOpen?styles.closed:""} ${className?className:""}`}>
    </footer>
}
