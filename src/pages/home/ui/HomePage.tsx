import { type FC } from 'react';

import { Tabs } from '@shared/ui';
import { Dropdown } from '@shared/ui/dropdown/Dropdown';

import { BettingTable } from '@widgets/bettingTable';
import { TABLE_DATA } from '@widgets/bettingTable/mockTable';
import { Carousel } from '@widgets/Carousel/ui/Carousel';
import { CategoryFiltersBar } from '@widgets/categoryFiltersBar';
import { HeroSection } from '@widgets/HeroSection';

import { carouselData } from '../constants/constants';
import styles from '../HomePage.module.scss';

const TabsItem = [
  {
    id: 'lastBets',
    value: 'lastBets',
    label: 'Последние ставки',
    active: true,
  },
  {
    id: 'MyBets',
    value: 'myBets',
    label: 'Мои ставки',
    active: false,
  },
  {
    id: 'bigPlayers',
    value: 'bigPlayers',
    label: 'Крупные игроки',
    active: false,
  },
];

const selectItems = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '40', label: '40' },
  { value: '50', label: '50' },
];

export const HomePage: FC = () => {
  return (
    <>
      <HeroSection />
      <CategoryFiltersBar />
      <div className={styles['main-carousel-section']}>
        {carouselData.map(item => {
          return <Carousel key={item.title} icon={item.icon} title={item.title} items={item.items} />;
        })}
      </div>
      <div className={styles.tableFilter}>
        <h4 className={styles.title}>Таблица ставок</h4>
        <div className={styles.wrapper}>
          <Tabs items={TabsItem} size={'s'} className={styles.tabs} />
          <div className={styles.dropdownWrapper}>
            <Dropdown value={'10'} options={selectItems} onChange={() => {}} />
          </div>
        </div>
      </div>
      <BettingTable items={TABLE_DATA} />
    </>
  );
};
