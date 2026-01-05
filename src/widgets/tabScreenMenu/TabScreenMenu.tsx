import type { FC } from 'react';
import { useState, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import { APP_PATH } from '@shared/config';

import { getTabMenuData } from './constants/constants';
import { TabMenuItem } from './tabMenuItem';
import styles from './TabScreenMenu.module.scss';

import { SearchModal, SlideUpMenu } from '@/widgets';

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
  const { t } = useTranslation('tabScreenMenu');
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSlideUpMenuOpen, setIsSlideUpMenuOpen] = useState(false);

  const tabMenuData = useMemo(() => getTabMenuData(t), [t]);

  // Вычисляем активный индекс на основе текущего маршрута и состояния модалки
  // Вычисляем напрямую в рендере для гарантии актуальности значения
  const SEARCH_INDEX = 0;
  const INVITE_INDEX = 1;
  const MAIN_INDEX = 2;
  const BONUSES_INDEX = 3;
  const MENU_INDEX = 4;

  let currentActiveIndex: number;

  // Если меню закрыто, никогда не возвращаем MENU_INDEX
  if (!isSlideUpMenuOpen) {
    if (isSearchModalOpen) {
      currentActiveIndex = SEARCH_INDEX; // Поиск
    } else {
      // Определяем активный индекс на основе текущего маршрута
      const path = location.pathname;

      if (path === APP_PATH.invite) {
        currentActiveIndex = INVITE_INDEX; // Инвайт
      } else if (path === APP_PATH.main) {
        currentActiveIndex = MAIN_INDEX; // Главная
      } else if (path === APP_PATH.bonuses) {
        currentActiveIndex = BONUSES_INDEX; // Бонусы
      } else {
        currentActiveIndex = SEARCH_INDEX; // По умолчанию
      }
    }
  } else {
    // Меню открыто
    if (isSearchModalOpen) {
      currentActiveIndex = SEARCH_INDEX; // Поиск имеет приоритет
    } else {
      currentActiveIndex = MENU_INDEX; // Меню активно только когда открыто
    }
  }

  const eclipseLeft = useMemo((): string => {
    if (!tabMenuData.length) return `${DEFAULT_CENTER}%`;
    const itemWidth = PERCENTAGE_MULTIPLIER / tabMenuData.length;
    const centerPercent = itemWidth * currentActiveIndex + itemWidth / DIVISOR_FOR_CENTER;

    // 46px ширина SVG, смещаем на половину
    return `calc(${centerPercent}% - ${SVG_HALF_WIDTH}px)`;
  }, [currentActiveIndex, tabMenuData.length]);

  const handleSlideUpMenuChange = (open: boolean): void => {
    setIsSlideUpMenuOpen(open);
  };

  const handleItemClick = (index: number): void => {
    // Навигация по индексам:
    // 0 - Поиск (открывает модалку)
    // 1 - Инвайт
    // 2 - Главная
    // 3 - Бонусы
    // 4 - Меню (открывает SlideUpMenu)

    const SEARCH_INDEX = 0;
    const INVITE_INDEX = 1;
    const MAIN_INDEX = 2;
    const BONUSES_INDEX = 3;
    const MENU_INDEX = 4;

    // Закрываем меню при клике на любую кнопку, если оно открыто
    if (isSlideUpMenuOpen && index !== MENU_INDEX) {
      setIsSlideUpMenuOpen(false);
    }

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
    } else if (index === MENU_INDEX) {
      // Меню - переключаем SlideUpMenu (toggle)
      setIsSlideUpMenuOpen(prev => !prev);
    }
  };

  return (
    <div className={clsx(styles.tabMenu, className)}>
      <div className={styles.container}>
        <div className={styles.eclipse} style={{ left: eclipseLeft }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="10" viewBox="0 0 46 10" fill="none">
            <path
              d="M38.9501 6.61166C34.6218 2.4826 29.0631 0 23 0C16.9369 0 11.3782 2.4826 7.04995 6.61166C4.99662 8.57047 2.58298 10 0 10H46C43.417 10 41.0034 8.57047 38.9501 6.61166Z"
              fill="#131824"
            />
          </svg>
        </div>
        {tabMenuData.map((item, index) => (
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
      <SlideUpMenu open={isSlideUpMenuOpen} onOpenChange={handleSlideUpMenuChange} />
    </div>
  );
};
