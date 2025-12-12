import styles from './CategorySwitcherWithSearch.module.scss'
import {Button, Input} from "@shared/ui";
import {SearchIcon} from "@shared/ui/icons";

export const CategorySwitcherWithSearch = () => {
    return (<div className={styles.root}>
        <Button className={styles.casinoButton} variant={'primary'} size={'m'} fullWidth>Казино</Button>
        <Button className={styles.sportButton} variant={'secondary'} size={'m'} fullWidth>Спорт</Button>
        <Input className={styles.searchInput} size={'m'} placeholder={'label'} icon={<SearchIcon/>}/>
    </div>)
}