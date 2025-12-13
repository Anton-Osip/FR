import styles from './Brand.module.scss'
import {FrostyIcon} from "@shared/ui/icons";

export const Brand = () => {
    return <div className = {styles.brand}>
        <FrostyIcon/>
        <span className={styles.text}>Frosty</span>
    </div>
}
