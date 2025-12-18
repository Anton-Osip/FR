import { Breadcrumbs } from "@shared/ui/breadcrumbs";
import styles from "./Bonuses.module.scss";
import {PromoCodeCard, RankCard} from "@widgets/bonusesPromo";
import { BenefitsSection } from "@widgets/benefitsSection/BenefitsSection";

const breadCrumbsItems = [{ label: "Бонусы" }];
export const Bonuses = () => {
    return (
        <div className={styles.bonuses}>
            <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs}/>
            <div className={styles.promoGrid}>
                <RankCard/>
                <PromoCodeCard/>
            </div>
             <BenefitsSection />
        </div>
    );
};
