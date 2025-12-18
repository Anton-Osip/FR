import {Breadcrumbs} from "@shared/ui/breadcrumbs";
import styles from "./Invite.module.scss";
import {RewardsCards} from "@widgets/rewardsCards";
import {ProgramTerms} from "@widgets/programTerms";

const breadCrumbsItems = [{label: "Инвайт"}];

export const Invite = () => {
    return (
        <div className={styles.invite}>
            <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs}/>
            <RewardsCards className={styles.rewardsCards}/>
            <ProgramTerms/>
        </div>
    );
};

