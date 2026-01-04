import { type FC, type ReactNode, useMemo, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@shared/api';
import { APP_PATH } from '@shared/constants/constants';
import { selectIsLoggedIn } from '@shared/store/slices/appSlice';
import { Button } from '@shared/ui';
import {
  BaccareIcon,
  BonusIcon,
  BurgerIcon,
  CardsIcon,
  FlashIcon,
  HeartIcon,
  HomeIcon,
  LikeIcon,
  MicrophoneIcon,
  RouletteIcon,
  SevenIcon,
  StarIcon,
  TwoUsersIcon,
} from '@shared/ui/icons';
import { PopularIcon } from '@shared/ui/icons/PopularIcon';

import { CategorySwitcherWithSearch } from './CategorySwitcherWithSearch/CategorySwitcherWithSearch';
import { MenuSection } from './MenuSection/MenuSection';
import styles from './Sidebar.module.scss';
import { SidebarFooter } from './SidebarFooter/SidebarFooter';

import { LoginModal } from '@/widgets/loginModal';

export interface MenuItems {
  id: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
}

interface SidebarProps {
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({ className }) => {
  const { t } = useTranslation('sidebar');
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const toggleIsOpen = (): void => setIsOpen(!isOpen);
  const openLoginModal = (): void => setIsLoginModalOpen(true);

  const NavigationItems: MenuItems[] = useMemo(
    () => [
      { id: '1', icon: <HomeIcon />, label: t('menuItems.home'), isActive: false, path: APP_PATH.main },
      {
        id: '2',
        icon: <HeartIcon />,
        label: t('menuItems.favorites'),
        isActive: false,
        path: APP_PATH.favorites,
      },
      { id: '3', icon: <TwoUsersIcon />, label: t('menuItems.invite'), isActive: false, path: APP_PATH.invite },
      { id: '4', icon: <BonusIcon />, label: t('menuItems.bonuses'), isActive: false, path: APP_PATH.bonuses },
    ],
    [t],
  );

  const Game1Items: MenuItems[] = useMemo(
    () => [
      { id: '1', icon: <SevenIcon />, label: t('menuItems.slots'), isActive: false },
      { id: '2', icon: <PopularIcon />, label: t('menuItems.popular'), isActive: false },
      { id: '3', icon: <FlashIcon />, label: t('menuItems.quickGames'), isActive: false },
      { id: '4', icon: <StarIcon />, label: t('menuItems.new'), isActive: false },
      { id: '5', icon: <LikeIcon />, label: t('menuItems.recommended'), isActive: false },
    ],
    [t],
  );

  const Game2Items: MenuItems[] = useMemo(
    () => [
      { id: '1', icon: <CardsIcon />, label: t('menuItems.blackjack'), isActive: false },
      { id: '2', icon: <RouletteIcon />, label: t('menuItems.roulette'), isActive: false },
      { id: '3', icon: <MicrophoneIcon />, label: t('menuItems.liveGames'), isActive: false },
      { id: '4', icon: <BaccareIcon />, label: t('menuItems.baccarat'), isActive: false },
    ],
    [t],
  );

  return (
    <div className={clsx(styles.sidebar, !isOpen ? styles.isOpen : '', className ?? className)}>
      <Button
        variant={'ghost'}
        onClick={toggleIsOpen}
        className={`${styles.burgerButton} ${!isOpen ? styles.isOpenBurger : ''}`}
        aria-label={t('buttons.toggleMenu')}
        title={t('buttons.toggleMenu')}
      >
        <BurgerIcon />
      </Button>
      <CategorySwitcherWithSearch className={styles.categorySwitcherWithSearch} isOpen={isOpen} />
      <nav className={styles.navigation}>
        <MenuSection
          list={NavigationItems}
          title={t('sections.navigation')}
          isOpen={isOpen}
          onRequireAuth={openLoginModal}
          isLoggedIn={isLoggedIn}
        />
        <MenuSection list={Game1Items} title={t('sections.games')} isOpen={isOpen} />
        <MenuSection list={Game2Items} title={t('sections.games')} isOpen={isOpen} />
      </nav>

      <div className={styles.sidebarFooter}>
        <SidebarFooter isOpen={isOpen} />
      </div>

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  );
};
