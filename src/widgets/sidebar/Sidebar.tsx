import { type FC, type ReactNode, useState } from 'react';

import { APP_PATH } from '@shared/constants/constants';
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

export interface MenuItems {
  id: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  path?: string;
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
  { id: '5 Рекомендованное', icon: <LikeIcon />, label: 'Рекомендованное', isActive: false },
];

const Game2Items: MenuItems[] = [
  { id: '1 Блэкджек', icon: <CardsIcon />, label: 'Блэкджек', isActive: false },
  { id: '2 Рулетка', icon: <RouletteIcon />, label: 'Рулетка', isActive: false },
  { id: '3 Live-игры', icon: <MicrophoneIcon />, label: 'Live-игры', isActive: false },
  { id: '4 Баккара', icon: <BaccareIcon />, label: 'Баккара', isActive: false },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleIsOpen = (): void => setIsOpen(!isOpen);

  return (
    <div className={`${styles.sidebar} ${!isOpen ? styles.isOpen : ''} ${className || ''}`}>
      <Button
        variant={'ghost'}
        onClick={toggleIsOpen}
        className={`${styles.burgerButton} ${!isOpen ? styles.isOpenBurger : ''}`}
      >
        <BurgerIcon />
      </Button>
      <CategorySwitcherWithSearch className={styles.categorySwitcherWithSearch} isOpen={isOpen} />
      <nav className={styles.navigation}>
        <MenuSection list={NavigationItems} title="Навигация" isOpen={isOpen} />
        <MenuSection list={Game1Items} title="Игры" isOpen={isOpen} />
        <MenuSection list={Game2Items} title="Игры" isOpen={isOpen} />
      </nav>

      <div className={styles.sidebarFooter}>
        <SidebarFooter isOpen={isOpen} />
      </div>
    </div>
  );
};
