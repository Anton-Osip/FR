import { FC, useEffect, useState, useRef } from 'react';

import { APP_PATH } from '@shared/constants/constants.ts';
import { Button, Input } from '@shared/ui';
import {
  BonusIcon,
  FlashIcon,
  HeartIcon,
  HomeIcon,
  SearchIcon,
  SevenIcon,
  StarIcon,
  SupportIcon,
  TwoUsersIcon,
} from '@shared/ui/icons';
import { PopularIcon } from '@shared/ui/icons/PopularIcon.tsx';

import { MenuItems } from '@widgets/sidebar/Sidebar.tsx';

import { MenuSection } from './MenuSection/MenuSection';
import styles from './SlideUpMenu.module.scss';

interface Props {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NavigationItems: MenuItems[] = [
  { id: '1 Главная', icon: <HomeIcon />, label: 'Главная', isActive: false, path: APP_PATH.main },
  { id: '2 Избранное', icon: <HeartIcon />, label: 'Избранное', isActive: false, path: APP_PATH.favorites },
  { id: '3 Инвайт', icon: <TwoUsersIcon />, label: 'Инвайт', isActive: false, path: APP_PATH.invite },
  { id: '4 Бонусы', icon: <BonusIcon />, label: 'Бонусы', isActive: false, path: APP_PATH.bonuses },
];

const Game1Items: MenuItems[] = [
  { id: '1 Слоты', icon: <SevenIcon />, label: 'Слоты', isActive: false },
  { id: '2 Популярное', icon: <PopularIcon />, label: 'Популярное', isActive: false },
  { id: '3 Быстрые игры', icon: <FlashIcon />, label: 'Быстрые игры', isActive: false },
  { id: '4 Новинки', icon: <StarIcon />, label: 'Новинки', isActive: false },
];

const ANIMATION_DURATION_MS = 300;

export const SlideUpMenu: FC<Props> = ({ className, open = false, onOpenChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Обработка открытия меню
  useEffect(() => {
    if (!open) {
      return;
    }

    // Устанавливаем shouldRender асинхронно через requestAnimationFrame
    const openTimer = requestAnimationFrame(() => {
      setShouldRender(true);
      // Принудительный reflow для гарантированного запуска transition
      requestAnimationFrame(() => {
        if (menuRef.current) {
          // Принудительный reflow - используем void для явного указания намерения
          void menuRef.current.offsetHeight;
        }
        setIsVisible(true);
      });
    });

    return () => {
      cancelAnimationFrame(openTimer);
    };
  }, [open]);

  // Обработка закрытия меню
  useEffect(() => {
    if (open) {
      return;
    }

    // Устанавливаем isVisible асинхронно
    const closeTimer = requestAnimationFrame(() => {
      setIsVisible(false);
    });

    const timer = setTimeout(() => {
      setShouldRender(false);
    }, ANIMATION_DURATION_MS);

    return () => {
      cancelAnimationFrame(closeTimer);
      clearTimeout(timer);
    };
  }, [open]);

  const handleItemClick = (): void => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div ref={menuRef} className={`${styles.slideUpMenu} ${isVisible ? styles.open : ''} ${className ?? ''}`}>
      <div className={styles.inputWrapper}>
        <Input type="text" size={'m'} icon={<SearchIcon />} />
      </div>
      <div className={styles.separator} />
      <MenuSection
        className={styles.navigation}
        list={NavigationItems}
        title="Навигация"
        onItemClick={handleItemClick}
      />
      <MenuSection className={styles.navigation} list={Game1Items} title="Игры" onItemClick={handleItemClick} />
      <div className={styles.support}>
        <Button variant={'tertiary'} className={styles.supportButton}>
          <SupportIcon />
        </Button>
        <div className={styles.banner}>
          <span className={styles.text}>Тех. поддержка</span>
          <span className={styles.time}>24/7</span>
        </div>
      </div>
    </div>
  );
};
