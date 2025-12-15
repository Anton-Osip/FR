import type {FC, ReactNode} from "react";
import {useEffect, useRef, useState} from "react";
import styles from './Tabs.module.scss'
import {Button} from "@shared/ui";

export interface Tab {
    id: string;
    value: string;
    label: string;
    icon?: ReactNode;
    active: boolean
}

interface TabsProps {
    className?: string;
    items: Tab[];
    onChange?: (value: string) => void;
    size?: 's' | 'm'
}

export const Tabs: FC<TabsProps> = ({className, items, onChange, size = 's'}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [isScrollable, setIsScrollable] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const activeIndex = items.findIndex(tab => tab.active);
        if (activeIndex === -1) return;

        const activeTab = tabRefs.current[activeIndex];
        const container = containerRef.current;
        if (!activeTab) return;

        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();

        const tabCenter = tabRect.left + tabRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const delta = tabCenter - containerCenter;

        container.scrollTo({
            left: container.scrollLeft + delta,
            behavior: "smooth",
        });

        // обновляем флаг скролла после позиционирования
        const {scrollWidth, clientWidth} = container;
        setIsScrollable(scrollWidth > clientWidth + 1);
    }, [items]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const updateScrollable = () => {
            const {scrollWidth, clientWidth} = container;
            setIsScrollable(scrollWidth > clientWidth + 1);
        };

        updateScrollable();
        window.addEventListener('resize', updateScrollable);
        return () => window.removeEventListener('resize', updateScrollable);
    }, []);

    const rootClassName = [
        styles.root,
        !isScrollable ? styles['root--no-fade'] : '',
        className ?? ''
    ].filter(Boolean).join(' ');

    return (
        <div className={rootClassName}>
            <div className={styles.wrapper} ref={containerRef}>
                {items.map((item, index) => {
                    return (
                        <Button
                            size={size}
                            key={item.id}
                            variant={'secondary'}
                            className={`${styles.tab} ${item.active ? styles.activeTabs : ''}`}
                            icon={item.icon}
                            active={item.active}
                            onClick={() => onChange?.(item.value)}
                            ref={el => {
                                tabRefs.current[index] = el;
                            }}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}