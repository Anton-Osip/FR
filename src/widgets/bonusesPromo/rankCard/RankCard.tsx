import styles from './RankCard.module.scss'
import silverBg from '@assets/icons/silver-bg.svg?url'

export const RankCard=()=>{
    return <div className={styles.rankCard}>
        <div className={styles.info}>
            <div className={styles.titleWrapper}>
                <h3 className={styles.title}></h3>
                <p className={styles.description}></p>
            </div>
        </div>
        <div className={styles.image}>
            <img className={styles.userInfoImage} src={silverBg} alt="silver" />
        </div>
    </div>
}