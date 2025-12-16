import {Input, Tabs} from "@shared/ui";
import {FireIcon, FlashIcon, MicrophoneIcon, SearchIcon, SevenIcon, WindowIcon} from "@shared/ui/icons";
import {type FC, useRef, useState} from "react";
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
    const [isInputExpanded, setIsInputExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleTabChange = (value: string) => {
        setTabs(prev =>
            prev.map(tab => ({
                ...tab,
                active: tab.value === value,
            })),
        );
    };

    const handleInputWrapperClick = () => {
        setIsInputExpanded((prev) => {
            const next = !prev;

            if (next) {
                inputRef.current?.focus();
            } else {
                inputRef.current?.blur();
            }

            return next;
        });
    };

    return (
        <div className={`${styles.root} ${className ?? ''}`}>
            <Tabs items={tabs} onChange={handleTabChange} size={'m'} className={styles.tabs}/>
            <div
                className={`${styles.inputWrapper} ${isInputExpanded ? styles.inputWrapperExpanded : ''}`}
                onClick={handleInputWrapperClick}
            >
                <Input ref={inputRef} icon={<SearchIcon/>} placeholder={"Поиск"}/>
            </div>
        </div>
    );
}