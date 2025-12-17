import {Button, Input, Tabs} from "@shared/ui";
import {FireIcon, FlashIcon, MicrophoneIcon, SearchIcon, SevenIcon, WindowIcon} from "@shared/ui/icons";
import {type FC, useState} from "react";
import styles from './CategoryFiltersBar.module.scss'

const INITIAL_TABS = [
    {
        id: '1',
        value: 'all',
        label: 'Все игры',
        icon: <WindowIcon/>,
        active: true
    },
    {
        id: '2',
        value: 'popular',
        label: 'Популярное',
        icon: <FireIcon/>,
        active: false
    },
    {
        id: '3',
        value: 'slots',
        label: 'Слоты',
        icon: <SevenIcon/>,
        active: false
    },
    {
        id: '4',
        value: 'liveGames',
        label: 'Live-игры',
        icon: <MicrophoneIcon/>,
        active: false
    },
    {
        id: '5',
        value: 'flashGames',
        label: 'Быстрые игры',
        icon: <FlashIcon/>,
        active: false
    }
]

interface CategoryFiltersBarProps {
    className?: string;
}

export const CategoryFiltersBar: FC<CategoryFiltersBarProps> = ({className}) => {
    const [tabs, setTabs] = useState(INITIAL_TABS);

    const handleTabChange = (value: string) => {
        setTabs(prev =>
            prev.map(tab => ({
                ...tab,
                active: tab.value === value,
            })),
        );
    };


    return (
        <div className={`${styles.root} ${className ?? ''}`}>
            <div className={styles.buttonWrapper}>
                <Button variant={'secondary'}>
                    <SearchIcon/>
                </Button>
            </div>
            <div className={styles.tabs}>
                <Tabs items={tabs} onChange={handleTabChange} size={'m'}/>
            </div>
            <div
                className={`${styles.inputWrapper}`}
            >
                <Input icon={<SearchIcon/>} placeholder={"Поиск"}/>
            </div>
        </div>
    );
}