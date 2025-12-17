import { UserBalance } from './UserBalance'
import { UserInfo } from './UserInfo'
import styles from './UserProfileInfo.module.scss'

export const UserProfileInfo = () => {
    return (<div className={styles.userInfo}>
        <UserInfo />
        <UserBalance isMain amount={1000584}/>
        <UserBalance isMain={false} amount={50265}/>
    </div>)
}