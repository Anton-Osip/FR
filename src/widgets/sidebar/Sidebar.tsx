import styles from './Sidebar.module.scss'
import {Button} from "@shared/ui";
import {BonusIcon, BurgerIcon, HeartIcon, HomeIcon, TwoUsersIcon} from "@shared/ui/icons";
import {CategorySwitcherWithSearch} from "./CategorySwitcherWithSearch/CategorySwitcherWithSearch.tsx";
import {MenuSection} from "./MenuSection/MenuSection.tsx";
import type {ReactNode} from "react";

interface MenuItems {
    id: string;
    icon: ReactNode
    label: string
}

const NavigationItems: MenuItems[] = [
    {id: '1 Главная', icon: <HomeIcon/>, label: 'Главная'},
    {id: '2 Избранное', icon: <HeartIcon/>, label: 'Избранное'},
    {id: '3 Инвайт', icon: <TwoUsersIcon/>, label: 'Инвайт'},
    {id: '4 Бонусы', icon: <BonusIcon/>, label: 'Бонусы'},
]

export const Sidebar = () => {
    return <div className={styles.sidebar}>
        <Button variant={'ghost'}><BurgerIcon/></Button>
        <CategorySwitcherWithSearch/>
        <MenuSection list={NavigationItems} title="Навигация"/>
    </div>
};