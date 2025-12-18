import styles from './MenuItem.module.scss'
import type {FC, ReactNode} from "react";
import {useRef, useState, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";

interface MenuItemProps {
    icon: ReactNode
    label: string
    isActive: boolean
    isOpen: boolean
    path?: string
}

export const MenuItem: FC<MenuItemProps> = ({label, icon, isActive, isOpen, path}) => {
    const itemRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const navigate = useNavigate();
    const location = useLocation();
    
    const isCurrentPath = path && location.pathname === path;

    useEffect(() => {
        if (isHovered && itemRef.current && !isOpen) {
            const rect = itemRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + rect.height / 2,
                left: rect.right
            });
        }
    }, [isHovered, isOpen]);

    const handleClick = () => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <>
            <button 
                ref={itemRef}
                className = {`${styles.item} ${(isActive || isCurrentPath) && styles.isActive} ${!isOpen ? styles.unVisible : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
            >
                <div className = {styles.iconWrapper}>
                    {icon}
                </div>
                <span className = {styles.label}>{label}</span>
            </button>
            {!isOpen && (
                <span 
                    className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`
                    }}
                >
                    {label}
                </span>
            )}
        </>
    )
}
