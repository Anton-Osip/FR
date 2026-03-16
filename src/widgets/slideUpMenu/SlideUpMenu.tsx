import React, { FC, useEffect, useState, useRef, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { selectIsLoggedIn } from '@app/store';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/config';
import { useSafeArea } from '@shared/lib/hooks/useSafeArea.tsx';
import { Button } from '@shared/ui';
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
  PopularIcon,
  CardsIcon,
  RouletteIcon,
  MicrophoneIcon,
  BaccareIcon,
  LikeIcon,
} from '@shared/ui/icons';

import { AuthModal } from '@widgets/authModal';
import type { MenuItems } from '@widgets/sidebar/types';

import { MenuSection } from './MenuSection/MenuSection';
import styles from './SlideUpMenu.module.scss';

import { useGetLinksResolveQuery } from '@features/links';

interface Props {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearchClick?: () => void;
}

const ANIMATION_DURATION_MS = 350;
const MIN_SWIPE_DISTANCE = 50;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const SWIPE_MIN_COMPLETE_DURATION_MS = 120;
const SWIPE_MAX_COMPLETE_DURATION_MS = ANIMATION_DURATION_MS;
const SWIPE_VELOCITY_FACTOR_MIN = 0.1;
const SWIPE_VELOCITY_FACTOR_MAX = 1.5;

const calculateSwipeCompleteDuration = (remainingDistance: number, swipeVelocity: number): number => {
  if (remainingDistance <= 0) {
    return ANIMATION_DURATION_MS;
  }

  const velocityFactor = Math.min(Math.max(swipeVelocity, SWIPE_VELOCITY_FACTOR_MIN), SWIPE_VELOCITY_FACTOR_MAX);
  const distanceRatio = Math.min(
    Math.max(remainingDistance / (typeof window !== 'undefined' ? window.innerHeight : 1), 0),
    1,
  );

  const rawDuration = ANIMATION_DURATION_MS * distanceRatio * (1 / velocityFactor);

  return Math.min(SWIPE_MAX_COMPLETE_DURATION_MS, Math.max(SWIPE_MIN_COMPLETE_DURATION_MS, rawDuration));
};

export const SlideUpMenu: FC<Props> = ({ className, open = false, onOpenChange, onSearchClick }) => {
  const { t } = useTranslation('tabScreenMenu');
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchStartScrollTop = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const currentTranslateY = useRef<number>(0);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const openLoginModal = (): void => setIsLoginModalOpen(true);

  const { data: linksResolve } = useGetLinksResolveQuery({});

  const navigationItems: MenuItems[] = useMemo(
    () => [
      { id: '1', icon: <HomeIcon />, label: t('slideUpMenu.menuItems.home'), isActive: false, path: APP_PATH.main },
      {
        id: '2',
        icon: <HeartIcon />,
        label: t('slideUpMenu.menuItems.favorites'),
        isActive: false,
        path: APP_PATH.favorites,
      },
      {
        id: '3',
        icon: <TwoUsersIcon />,
        label: t('slideUpMenu.menuItems.invite'),
        isActive: false,
        path: APP_PATH.invite,
      },
      {
        id: '4',
        icon: <BonusIcon />,
        label: t('slideUpMenu.menuItems.bonuses'),
        isActive: false,
        path: APP_PATH.bonuses,
      },
    ],
    [t],
  );

  const game1Items: MenuItems[] = useMemo(
    () => [
      {
        id: '1',
        icon: <SevenIcon />,
        label: t('slideUpMenu.menuItems.slots'),
        path: APP_PATH.slots.replace(':type', 'allGames'),
        isActive: false,
      },
      {
        id: '2',
        icon: <PopularIcon />,
        label: t('slideUpMenu.menuItems.popular'),
        path: APP_PATH.slots.replace(':type', 'popularGames'),
        isActive: false,
      },
      {
        id: '3',
        icon: <FlashIcon />,
        label: t('slideUpMenu.menuItems.quickGames'),
        path: APP_PATH.slots.replace(':type', 'quickGames'),
        isActive: false,
      },
      {
        id: '4',
        icon: <StarIcon />,
        label: t('slideUpMenu.menuItems.new'),
        path: APP_PATH.slots.replace(':type', 'newGames'),
        isActive: false,
      },
      {
        id: '5',
        icon: <LikeIcon />,
        label: t('slideUpMenu.menuItems.recommended'),
        isActive: false,
        path: APP_PATH.slots.replace(':type', 'recommendedGames'),
      },
    ],
    [t],
  );

  const game2Items: MenuItems[] = useMemo(
    () => [
      {
        id: '1',
        icon: <CardsIcon />,
        label: t('slideUpMenu.menuItems.blackjack'),
        isActive: false,
        path: APP_PATH.slots.replace(':type', 'blackjackGames'),
      },
      {
        id: '2',
        icon: <RouletteIcon />,
        label: t('slideUpMenu.menuItems.roulette'),
        isActive: false,
        path: APP_PATH.slots.replace(':type', 'rouletteGames'),
      },
      {
        id: '3',
        icon: <MicrophoneIcon />,
        label: t('slideUpMenu.menuItems.liveGames'),
        isActive: false,
        path: APP_PATH.slots.replace(':type', 'liveGames'),
      },
      {
        id: '4',
        icon: <BaccareIcon />,
        label: t('slideUpMenu.menuItems.baccarat'),
        isActive: false,
        path: APP_PATH.slots.replace(':type', 'baccaratGames'),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);

      const openTimer = setTimeout(() => {
        if (menuRef.current) {
          // форсируем рефлоу, чтобы анимация открытия всегда срабатывала
          void menuRef.current.offsetHeight;
        }

        setIsVisible(true);
      }, 0);

      return () => {
        clearTimeout(openTimer);
      };
    }

    // закрытие
    setIsVisible(false);

    const closeTimer = setTimeout(() => {
      setShouldRender(false);
    }, ANIMATION_DURATION_MS);

    return () => {
      clearTimeout(closeTimer);
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
    currentTranslateY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!menuRef.current) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const scrollTop = menuRef.current.scrollTop;
    const scrollDelta = scrollTop - touchStartScrollTop.current;

    if (scrollDelta !== 0 || scrollTop > 0) {
      return;
    }

    if (deltaY > 0) {
      isSwiping.current = true;

      menuRef.current.style.transition = 'none';
      const translateY = Math.min(deltaY, window.innerHeight);

      currentTranslateY.current = translateY;
      menuRef.current.style.transform = `translateY(${translateY}px)`;
    } else if (deltaY < 0 && isSwiping.current) {
      menuRef.current.style.transition = 'none';
      menuRef.current.style.transform = 'translateY(0)';
      currentTranslateY.current = 0;
      isSwiping.current = false;
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

    if (scrollDelta !== 0 || scrollTop > 0) {
      menuRef.current.style.transition = '';
      menuRef.current.style.transform = '';
      isSwiping.current = false;

      return;
    }

    if (!isSwiping.current || deltaY <= 0) {
      menuRef.current.style.transition = `transform ${ANIMATION_DURATION_MS}ms ease-out`;
      menuRef.current.style.transform = 'translateY(0)';
      isSwiping.current = false;
      currentTranslateY.current = 0;

      return;
    }

    const swipeVelocity = deltaY / Math.max(deltaTime, 1);

    const shouldCloseByDistance = deltaY > SWIPE_DISTANCE_THRESHOLD;
    const shouldCloseByVelocity = deltaY > MIN_SWIPE_DISTANCE && swipeVelocity > SWIPE_VELOCITY_THRESHOLD;

    if (shouldCloseByDistance || shouldCloseByVelocity) {
      const startTranslateY = currentTranslateY.current || deltaY;
      const remainingDistance = typeof window !== 'undefined' ? Math.max(window.innerHeight - startTranslateY, 0) : 0;
      const duration = calculateSwipeCompleteDuration(remainingDistance, swipeVelocity);

      menuRef.current.style.transition = `transform ${duration}ms ease-out`;

      if (typeof window !== 'undefined') {
        menuRef.current.style.transform = `translateY(${window.innerHeight}px)`;
      }

      setTimeout(() => {
        if (!menuRef.current) {
          return;
        }

        menuRef.current.style.transition = '';
        menuRef.current.style.transform = '';
        currentTranslateY.current = 0;
        isSwiping.current = false;

        if (onOpenChange) {
          onOpenChange(false);
        }
      }, duration);

      return;
    }

    // Свайп недостаточный — возвращаем меню в исходное положение
    menuRef.current.style.transition = `transform ${ANIMATION_DURATION_MS}ms ease-out`;
    menuRef.current.style.transform = 'translateY(0)';
    isSwiping.current = false;
    currentTranslateY.current = 0;
  };

  const handleTouchCancel = (): void => {
    if (!menuRef.current) {
      return;
    }

    menuRef.current.style.transition = '';
    menuRef.current.style.transform = '';
    isSwiping.current = false;
    currentTranslateY.current = 0;
  };

  const { isIOS, isMobile, isAndroid } = useSafeArea();

  return (
    <>
      {shouldRender && (
        <div
          ref={menuRef}
          className={clsx(
            styles.slideUpMenu,
            isVisible && styles.open,
            isMobile && styles.mobile,
            isAndroid && styles.android,
            isIOS && styles.ios,
            className,
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div className={styles.inputWrapper}>
            <Button className={styles.searchButton} variant={'secondary'} size={'m'} onClick={onSearchClick}>
              <span className={styles.searchIcon}>{<SearchIcon />}</span>
              <span className={styles.searchLabel}>{t('slideUpMenu.searchPlaceholder')}</span>
            </Button>
          </div>

          <div className={styles.separator} />
          <MenuSection
            className={styles.navigation}
            list={navigationItems}
            title={t('slideUpMenu.sections.navigation')}
            onItemClick={handleItemClick}
            onRequireAuth={openLoginModal}
            isLoggedIn={isLoggedIn}
          />
          <MenuSection
            className={styles.navigation}
            list={game1Items}
            title={t('slideUpMenu.sections.games')}
            onItemClick={handleItemClick}
          />
          <MenuSection
            className={styles.navigation}
            list={game2Items}
            title={t('slideUpMenu.sections.liveCasino')}
            onItemClick={handleItemClick}
          />
          <div className={styles.support} onClick={() => window.open(String(linksResolve?.links.support), '_blank')}>
            <Button variant={'tertiary'} className={styles.supportButton}>
              <SupportIcon />
            </Button>
            <div className={styles.banner}>
              <span className={styles.text}>{t('slideUpMenu.support.title')}</span>
              <span className={styles.time}>24/7</span>
            </div>
          </div>
        </div>
      )}
      <AuthModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
};
