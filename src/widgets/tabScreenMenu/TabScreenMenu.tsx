import type { FC } from 'react';
import { useState, useMemo } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { APP_PATH } from '@shared/constants/constants';

import { TAB_MENU_DATA } from './constants/constants';
import { TabMenuItem } from './tabMenuItem';
import styles from './TabScreenMenu.module.scss';

import { SearchModal } from '@/widgets';

interface Props {
  className?: string;
}

const DEFAULT_CENTER = 50;
const SVG_WIDTH = 46;
const SVG_HALF_DIVISOR = 2;
const SVG_HALF_WIDTH = SVG_WIDTH / SVG_HALF_DIVISOR;
const PERCENTAGE_MULTIPLIER = 100;
const DIVISOR_FOR_CENTER = 2;

export const TabScreenMenu: FC<Props> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Вычисляем активный индекс на основе текущего маршрута и состояния модалки
  const currentActiveIndex = useMemo(() => {
    const SEARCH_INDEX = 0;
    const INVITE_INDEX = 1;
    const MAIN_INDEX = 2;
    const BONUSES_INDEX = 3;

    if (isSearchModalOpen) {
      return SEARCH_INDEX; // Поиск
    }

    const path = location.pathname;

    if (path === APP_PATH.invite) {
      return INVITE_INDEX; // Инвайт
    } else if (path === APP_PATH.main) {
      return MAIN_INDEX; // Главная
    } else if (path === APP_PATH.bonuses) {
      return BONUSES_INDEX; // Бонусы
    }

    return SEARCH_INDEX; // По умолчанию
  }, [location.pathname, isSearchModalOpen]);

  const eclipseLeft = useMemo((): string => {
    if (!TAB_MENU_DATA.length) return `${DEFAULT_CENTER}%`;
    const itemWidth = PERCENTAGE_MULTIPLIER / TAB_MENU_DATA.length;
    const centerPercent = itemWidth * currentActiveIndex + itemWidth / DIVISOR_FOR_CENTER;

    // 46px ширина SVG, смещаем на половину
    return `calc(${centerPercent}% - ${SVG_HALF_WIDTH}px)`;
  }, [currentActiveIndex]);

  const handleItemClick = (index: number): void => {
    // Навигация по индексам:
    // 0 - Поиск (открывает модалку)
    // 1 - Инвайт
    // 2 - Главная
    // 3 - Бонусы
    // 4 - Меню (пока без действия)

    const SEARCH_INDEX = 0;
    const INVITE_INDEX = 1;
    const MAIN_INDEX = 2;
    const BONUSES_INDEX = 3;

    if (index === SEARCH_INDEX) {
      // Поиск - открываем модалку
      setIsSearchModalOpen(true);
    } else if (index === INVITE_INDEX) {
      // Инвайт
      navigate(APP_PATH.invite);
    } else if (index === MAIN_INDEX) {
      // Главная
      navigate(APP_PATH.main);
    } else if (index === BONUSES_INDEX) {
      // Бонусы
      navigate(APP_PATH.bonuses);
    }
    // Индекс 4 (Меню) пока без действия - активный индекс останется прежним
  };

  return (
    <div className={`${styles.tabMenu} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.eclipse} style={{ left: eclipseLeft }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="10" viewBox="0 0 46 10" fill="none">
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
      <SearchModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} />
    </div>
  );
};
