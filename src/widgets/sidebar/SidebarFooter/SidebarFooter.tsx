import styles from './SidebarFooter.module.scss'
import {SideBarFooterIcon} from "@shared/ui/icons";

export const SidebarFooter = () => {
    return <footer className = {styles.footer}>
        <div className={styles.icon}>
            <SideBarFooterIcon/>
        </div>
    </footer>
}
