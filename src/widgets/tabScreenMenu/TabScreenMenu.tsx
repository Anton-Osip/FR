import type { FC } from 'react';
import { useState, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';

import { AuthModal } from '@widgets/authModal';
import { SearchModal } from '@widgets/searchModal';
import { SlideUpMenu } from '@widgets/slideUpMenu/SlideUpMenu';

import { getTabMenuData } from './constants/constants';
import { TabMenuItem } from './tabMenuItem';
import styles from './TabScreenMenu.module.scss';

import { useGetBonusNotificationsQuery } from '@features/bonus';

interface Props {
  className?: string;
}

const DEFAULT_CENTER = 50;
const SVG_WIDTH = 46;
const SVG_HALF_DIVISOR = 2;
const SVG_HALF_WIDTH = SVG_WIDTH / SVG_HALF_DIVISOR;
const PERCENTAGE_MULTIPLIER = 100;
const DIVISOR_FOR_CENTER = 2;

// Индексы элементов меню
const TAB_INDICES = {
  SEARCH: 0,
  INVITE: 1,
  MAIN: 2,
  BONUSES: 3,
  MENU: 4,
} as const;

export const TabScreenMenu: FC<Props> = ({ className }) => {
  const { t } = useTranslation('tabScreenMenu');
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSlideUpMenuOpen, setIsSlideUpMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const openLoginModal = (): void => setIsLoginModalOpen(true);

  const { data } = useGetBonusNotificationsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const tabMenuData = useMemo(() => getTabMenuData(t), [t]);

  const currentActiveIndex = useMemo(() => {
    if (isSearchModalOpen) return TAB_INDICES.SEARCH;
    if (isSlideUpMenuOpen) return TAB_INDICES.MENU;

    const pathToIndex: Record<string, number> = {
      [APP_PATH.invite]: TAB_INDICES.INVITE,
      [APP_PATH.main]: TAB_INDICES.MAIN,
      [APP_PATH.bonuses]: TAB_INDICES.BONUSES,
    };

    return pathToIndex[location.pathname] ?? TAB_INDICES.SEARCH;
  }, [isSearchModalOpen, isSlideUpMenuOpen, location.pathname]);

  const eclipseLeft = useMemo((): string => {
    if (!tabMenuData.length) return `${DEFAULT_CENTER}%`;
    const itemWidth = PERCENTAGE_MULTIPLIER / tabMenuData.length;
    const centerPercent = itemWidth * currentActiveIndex + itemWidth / DIVISOR_FOR_CENTER;

    return `calc(${centerPercent}% - ${SVG_HALF_WIDTH}px)`;
  }, [currentActiveIndex, tabMenuData.length]);

  const handleSlideUpMenuChange = (open: boolean): void => {
    setIsSlideUpMenuOpen(open);
  };

  const handleSlideUpSearchClick = (): void => {
    setIsSlideUpMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  const handleItemClick = (index: number): void => {
    if (isSlideUpMenuOpen && index !== TAB_INDICES.MENU) {
      setIsSlideUpMenuOpen(false);
    }

    if (index === TAB_INDICES.SEARCH) {
      // Поиск - открываем модалку
      setIsSearchModalOpen(true);
    } else if (index === TAB_INDICES.INVITE) {
      // Инвайт - проверяем авторизацию
      if (!isLoggedIn) {
        openLoginModal();

        return;
      }
      navigate(APP_PATH.invite);
    } else if (index === TAB_INDICES.MAIN) {
      // Главная
      navigate(APP_PATH.main);
    } else if (index === TAB_INDICES.BONUSES) {
      // Бонусы - проверяем авторизацию
      if (!isLoggedIn) {
        openLoginModal();

        return;
      }
      navigate(APP_PATH.bonuses);
    } else if (index === TAB_INDICES.MENU) {
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
            notifications={index === TAB_INDICES.BONUSES && data?.has_cashback ? 1 : undefined}
          />
        ))}
      </div>
      <SearchModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} />
      <SlideUpMenu
        open={isSlideUpMenuOpen}
        onOpenChange={handleSlideUpMenuChange}
        onSearchClick={handleSlideUpSearchClick}
      />
      <AuthModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  );
};
