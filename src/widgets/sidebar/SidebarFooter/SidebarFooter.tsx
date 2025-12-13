import styles from './SidebarFooter.module.scss'
import type {FC} from "react";

interface SidebarFooterProps {
    isOpen:boolean
}

export const SidebarFooter:FC<SidebarFooterProps> = ({isOpen}) => {
    return <footer className = {`${styles.footer} ${!isOpen?styles.closed:""}`}>
    </footer>
}
