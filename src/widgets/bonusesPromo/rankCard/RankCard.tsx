import styles from './RankCard.module.scss'
import silverBg from '@assets/images/silver.png'
import * as Progress from "@radix-ui/react-progress";
import {GoldIcon, SilverIcon} from "@shared/ui/icons";


export const RankCard = () => {
    const amount = '25.1'
    const maxAmountinK = 100;
    const progressPercent = (parseFloat(amount) / maxAmountinK) * 100;

    return <div className={styles.rankCard}>
        <div className={styles.info}>
            <div className={styles.titleWrapper}>
                <h3 className={styles.title}>Серебро</h3>
                <p className={styles.description}>Актуальный ранг</p>
            </div>
            <div className={styles.userAmountBlock}>
                <div className={styles.amountWrap}>
                    <p>
                        {amount}K&nbsp;₽&nbsp;&nbsp;/&nbsp;&nbsp;{maxAmountinK}K&nbsp;₽
                    </p>
                    <p className={styles.description}>
                        Оборот
                    </p>
                </div>
                <Progress.Root className={styles.progress} value={progressPercent}>
                    <Progress.Indicator
                        className={styles.progressIndicator}
                        style={{transform: `translateX(-${100 - progressPercent}%)`}}
                    />
                </Progress.Root>
                <div className={styles.moneyWrap}>
                    <div className={styles.moneyItemWrap}>
                        <SilverIcon/>
                        <p>Серебро</p>
                    </div>
                    <div className={styles.moneyItemWrap}>
                        <GoldIcon/>
                        <p>Золото</p>
                    </div>
                </div>
            </div>
        </div>
        <div className={styles.image}>
            <img className={styles.userInfoImage} src={silverBg} alt="silver"/>
        </div>
    </div>
}