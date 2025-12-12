import type {FC, ReactNode} from "react";
import {MenuItem} from "./MenuItem/MenuItem.tsx";

interface MenuSectionProps {
    list: MenuItems[]
    title: string
}

interface MenuItems {
    id: string
    icon: ReactNode
    label: string
}

export const MenuSection: FC<MenuSectionProps> = ({list, title}) => {
    return (<div>
        <h3>{title}</h3>
        {list.map(item => (<MenuItem />))}
    </div>)

}