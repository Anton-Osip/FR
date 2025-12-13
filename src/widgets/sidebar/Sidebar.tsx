import styles from './Sidebar.module.scss'
import {Button} from "@shared/ui";
import {
    BaccareIcon,
    BonusIcon,
    BurgerIcon,
    CardsIcon,
    FlashIcon,
    HeartIcon,
    HomeIcon,
    LikeIcon, MicrophoneIcon,
    RouletteIcon,
    SevenIcon,
    StarIcon,
    TwoUsersIcon
} from "@shared/ui/icons";
import {CategorySwitcherWithSearch} from "./CategorySwitcherWithSearch/CategorySwitcherWithSearch.tsx";
import {MenuSection} from "./MenuSection/MenuSection.tsx";
import {type FC, type ReactNode, useState} from "react";
import {PopularIcon} from "@shared/ui/icons/PopularIcon.tsx";
import {SidebarFooter} from "./SidebarFooter/SidebarFooter.tsx";

interface MenuItems {
    id: string;
    icon: ReactNode
    label: string
    isActive: boolean
}

const NavigationItems: MenuItems[] = [
    {id: '1 Главная', icon: <HomeIcon/>, label: 'Главная', isActive: true},
    {id: '2 Избранное', icon: <HeartIcon/>, label: 'Избранное', isActive: false},
    {id: '3 Инвайт', icon: <TwoUsersIcon/>, label: 'Инвайт', isActive: false},
    {id: '4 Бонусы', icon: <BonusIcon/>, label: 'Бонусы', isActive: false},
]

const Game1Items: MenuItems[] = [
    {id: '1 Слоты', icon: <SevenIcon/>, label: 'Слоты', isActive: false},
    {id: '2 Популярное', icon: <PopularIcon/>, label: 'Популярное', isActive: false},
    {id: '3 Быстрые игры', icon: <FlashIcon/>, label: 'Быстрые игры', isActive: false},
    {id: '4 Новинки', icon: <StarIcon/>, label: 'Новинки', isActive: false},
    {id: '5 Рекомендованное', icon: <LikeIcon/>, label: 'Рекомендованное', isActive: false},
]

const Game2Items: MenuItems[] = [
    {id: '1 Блэкджек', icon: <CardsIcon/>, label: 'Блэкджек', isActive: false},
    {id: '2 Рулетка', icon: <RouletteIcon/>, label: 'Рулетка', isActive: false},
    {id: '3 Live-игры', icon: <MicrophoneIcon/>, label: 'Live-игры', isActive: false},
    {id: '4 Баккара', icon: <BaccareIcon/>, label: 'Баккара', isActive: false},
]

interface SidebarProps {
    className?: string;
}

export const Sidebar: FC<SidebarProps> = ({className}) => {
    const [isOpen, setIsOpen] = useState<boolean>(true)

    const toggleIsOpen = () => setIsOpen(!isOpen)
    const openSidebar = () => {
        setIsOpen(true)
    }
    return <div className = {`${styles.sidebar} ${!isOpen ? styles.isOpen : ''} ${className || ''}`}>
        <Button variant = {'ghost'} onClick = {toggleIsOpen}><BurgerIcon/></Button>
        <CategorySwitcherWithSearch isOpen = {isOpen} openSidebar = {openSidebar}/>
        <nav className = {styles.navigation}>
            <MenuSection list = {NavigationItems} title = "Навигация" isOpen = {isOpen}/>
            <MenuSection list = {Game1Items} title = "Игры" isOpen = {isOpen}/>
            <MenuSection list = {Game2Items} title = "Игры" isOpen = {isOpen}/>
        </nav>
        <SidebarFooter isOpen = {isOpen}/>
    </div>
};
