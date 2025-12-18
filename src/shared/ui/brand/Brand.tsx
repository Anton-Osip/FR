import styles from './Brand.module.scss'
import {FrostyIcon} from "@shared/ui/icons";
import type {FC} from "react";
import {useNavigate} from "react-router-dom";
import {APP_PATH} from "@shared/constants/constants";

interface BrandProps {
    className?: string;
}

export const Brand: FC<BrandProps> = ({className}) => {
    const navigate = useNavigate();
    return <div className={`${styles.brand} ${className ? className : ""}`} onClick={()=>{navigate(APP_PATH.main)}}>
        <div className={styles.frostyIcon}>
            <FrostyIcon/>
        </div>
        <span className={styles.text}>Frosty</span>
    </div>
}
