import React, { FC, useEffect, useState, useRef } from 'react';

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
const MIN_SWIPE_DISTANCE = 50; // Минимальное расстояние для быстрого свайпа

export const SlideUpMenu: FC<Props> = ({ className, open = false, onOpenChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartScrollTop = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const openTimer = requestAnimationFrame(() => {
      setShouldRender(true);
      requestAnimationFrame(() => {
        if (menuRef.current) {
          void menuRef.current.offsetHeight;
        }
        setIsVisible(true);
      });
    });

    return () => {
      cancelAnimationFrame(openTimer);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      return;
    }

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!menuRef.current) {
      return;
    }

    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    touchStartScrollTop.current = menuRef.current.scrollTop;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!menuRef.current) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const scrollTop = menuRef.current.scrollTop;
    const scrollDelta = scrollTop - touchStartScrollTop.current;

    // Если пользователь скроллит контент внутри меню, не обрабатываем свайп для закрытия
    if (scrollDelta !== 0 || scrollTop > 0) {
      return;
    }

    // Если свайп вниз и меню не скроллится, применяем трансформацию
    if (deltaY > 0) {
      isSwiping.current = true;
      // Временно отключаем transition для плавного свайпа
      menuRef.current.style.transition = 'none';
      const translateY = Math.min(deltaY, window.innerHeight);

      menuRef.current.style.transform = `translateY(${translateY}px)`;
    } else if (deltaY < 0 && isSwiping.current) {
      // Если пользователь меняет направление наверх, возвращаем меню
      menuRef.current.style.transition = 'none';
      menuRef.current.style.transform = 'translateY(0)';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!menuRef.current) {
      return;
    }

    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const scrollTop = menuRef.current.scrollTop;
    const scrollDelta = scrollTop - touchStartScrollTop.current;

    // Восстанавливаем transition
    menuRef.current.style.transition = '';

    // Если пользователь скроллил контент, не закрываем меню
    if (scrollDelta !== 0 || scrollTop > 0) {
      menuRef.current.style.transform = '';
      isSwiping.current = false;

      return;
    }

    // Закрываем меню, если свайп вниз достаточно большой или быстрый
    const SWIPE_THRESHOLD = 100; // Минимальное расстояние для закрытия
    const SWIPE_VELOCITY_THRESHOLD = 0.3; // Минимальная скорость свайпа (px/ms)

    if (isSwiping.current && deltaY > 0) {
      const swipeVelocity = deltaY / deltaTime;

      if (deltaY > SWIPE_THRESHOLD || (deltaY > MIN_SWIPE_DISTANCE && swipeVelocity > SWIPE_VELOCITY_THRESHOLD)) {
        if (onOpenChange) {
          onOpenChange(false);
        }
      } else {
        menuRef.current.style.transform = '';
      }
    } else {
      menuRef.current.style.transform = '';
    }

    isSwiping.current = false;
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`${styles.slideUpMenu} ${isVisible ? styles.open : ''} ${className ?? ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.inputWrapper}>
        <Input className={styles.input} type="text" size={'m'} icon={<SearchIcon />} />
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
