import {Breadcrumbs} from "@shared/ui/breadcrumbs";
import styles from "./Invite.module.scss";

const breadCrumbsItems = [{label: "Инвайт"}];

export const Invite = () => {
    return (
        <div className={styles.invite}>
            <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs}/>
            <div className={styles.content}>
                <h2>Инвайт</h2>
                <p>Приглашайте друзей и получайте бонусы</p>
            </div>
        </div>
    );
};

