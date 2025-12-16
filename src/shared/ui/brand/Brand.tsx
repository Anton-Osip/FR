import styles from './Brand.module.scss'
import {FrostyIcon} from "@shared/ui/icons";
import type {FC} from "react";

interface BrandProps {
    className?: string;
}

export const Brand: FC<BrandProps> = ({className}) => {
    return <div className={`${styles.brand} ${className ? className : ""}`}>
        <div className={styles.frostyIcon}>
            <FrostyIcon/>
        </div>
        <span className={styles.text}>Frosty</span>
    </div>
}
