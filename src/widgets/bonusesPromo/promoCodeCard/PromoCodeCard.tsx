import styles from './PromoCodeCard.module.scss'
import promoCode from '@assets/images/promoCodeIcon.png'
import {Button, Input} from "@shared/ui";


export const PromoCodeCard = () => {
    return <div className={styles.rankCard}>
        <div className={styles.info}>
            <div className={styles.titleWrapper}>
                <h3 className={styles.title}>Промокод</h3>
                <p className={styles.description}>Введите промокод в поле,
                    чтобы получить бонус</p>
            </div>
            <div className={styles.promocode}>
                <Input placeholder={'Промокод'} size={'m'}/>
                <Button size={'m'}>Активировать</Button>
            </div>
        </div>
        <div className={styles.imageWrapper}>
            <img className={styles.image} src={promoCode} alt="promoCode"/>
        </div>
    </div>
}