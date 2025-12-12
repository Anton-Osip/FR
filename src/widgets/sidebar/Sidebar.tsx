import styles from './Sidebar.module.scss'
import {Button} from "@shared/ui";
import {BurgerIcon} from "@shared/assets/icons";

export const Sidebar = () => {
    return <div className={styles.sidebar}>
        <Button variant={'ghost'} ><BurgerIcon/></Button>


    </div>
};