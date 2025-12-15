import styles from "../HomePage.module.scss";
import {BettingTable} from "@widgets/bettingTable";
import {TABLE_DATA} from "@widgets/bettingTable/mockTable.tsx";



export const HomePage = () => {
    return (
        <div className={styles["main-carousel-section"]}>
            <BettingTable items={TABLE_DATA}/>
        </div>
    );
};
