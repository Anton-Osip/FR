import type { FC } from "react";
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TAB_MENU_DATA } from "./constants/constants";
import { TabMenuItem } from "./tabMenuItem";
import { SearchModal } from "../searchModal";
import { APP_PATH } from "@shared/constants/constants";
import styles from "./TabScreenMenu.module.scss";

interface Props {
  className?: string;
}

export const TabScreenMenu: FC<Props> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Вычисляем активный индекс на основе текущего маршрута и состояния модалки
  const currentActiveIndex = useMemo(() => {
    if (isSearchModalOpen) {
      return 0; // Поиск
    }
    
    const path = location.pathname;
    if (path === APP_PATH.invite) {
      return 1; // Инвайт
    } else if (path === APP_PATH.main) {
      return 2; // Главная
    } else if (path === APP_PATH.bonuses) {
      return 3; // Бонусы
    }
    
    return 0; // По умолчанию
  }, [location.pathname, isSearchModalOpen]);

  const eclipseLeft = useMemo(() => {
    if (!TAB_MENU_DATA.length) return "50%";
    const itemWidth = 100 / TAB_MENU_DATA.length;
    const centerPercent = itemWidth * currentActiveIndex + itemWidth / 2;
    // 46px ширина SVG, смещаем на половину
    return `calc(${centerPercent}% - 23px)`;
  }, [currentActiveIndex]);

  const handleItemClick = (index: number) => {
    // Навигация по индексам:
    // 0 - Поиск (открывает модалку)
    // 1 - Инвайт
    // 2 - Главная
    // 3 - Бонусы
    // 4 - Меню (пока без действия)
    
    if (index === 0) {
      // Поиск - открываем модалку
      setIsSearchModalOpen(true);
    } else if (index === 1) {
      // Инвайт
      navigate(APP_PATH.invite);
    } else if (index === 2) {
      // Главная
      navigate(APP_PATH.main);
    } else if (index === 3) {
      // Бонусы
      navigate(APP_PATH.bonuses);
    }
    // Индекс 4 (Меню) пока без действия - активный индекс останется прежним
  };

  return (
    <div className={`${styles.tabMenu} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.eclipse} style={{ left: eclipseLeft }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46"
            height="10"
            viewBox="0 0 46 10"
            fill="none"
          >
            <path
              d="M38.9501 6.61166C34.6218 2.4826 29.0631 0 23 0C16.9369 0 11.3782 2.4826 7.04995 6.61166C4.99662 8.57047 2.58298 10 0 10H46C43.417 10 41.0034 8.57047 38.9501 6.61166Z"
              fill="#131824"
            />
          </svg>
        </div>
        {TAB_MENU_DATA.map((item, index) => (
          <TabMenuItem
            key={item.id}
            title={item.title}
            icon={item.icon}
            isActive={index === currentActiveIndex}
            onClick={() => handleItemClick(index)}
          />
        ))}
      </div>
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </div>
  );
};
