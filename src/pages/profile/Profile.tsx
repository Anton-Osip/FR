import {Breadcrumbs} from "@shared/ui/breadcrumbs";
import {UserProfileInfo} from "@widgets/userProfileInfo";
import styles from "./Profile.module.scss";
import {TransactionHistory} from "@widgets/transactionHistory";
import {SupportPanel} from "@widgets/supportPanel";

const breadCrumbsItems = [{label: "Профиль"}];

export const Profile = () => {
    return (
        <div className={styles.profile}>
            <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs}/>
            <UserProfileInfo/>
            <TransactionHistory/>
            <SupportPanel/>
        </div>
    );
};
