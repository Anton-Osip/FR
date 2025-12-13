import styles from './CategorySwitcherWithSearch.module.scss'
import {Button, Input} from "@shared/ui";
import {SearchIcon} from "@shared/ui/icons";
import {type FC, useRef} from "react";

interface CategorySwitcherWithSearchProps {
    isOpen: boolean
    openSidebar: () => void
}


export const CategorySwitcherWithSearch: FC<CategorySwitcherWithSearchProps> = ({isOpen, openSidebar}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const focusOnInput = () => {
        openSidebar()
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }
    return (<div className = {`${styles.root} ${isOpen ? '' : styles.isOpen}`}>
        <Button className = {styles.casinoButton} variant = {'primary'} size = {'m'} fullWidth>Казино</Button>
        <Button className = {styles.sportButton} variant = {'secondary'} size = {'m'} fullWidth>Спорт</Button>
        <div onClick = {focusOnInput} className = {styles.searchInput}>
            <Input ref = {inputRef} size = {'m'} placeholder = {'label'} icon = {<SearchIcon/>}
                   onFocus = {openSidebar}/>
        </div>

    </div>)
}
