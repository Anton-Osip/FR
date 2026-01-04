import { type FC, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { getCarouselData, getCategoryTabs } from './constants';
import styles from './MainCarouselSection.module.scss';

import { Carousel, CategoryFiltersBar } from '@/widgets';

interface MainCarouselSectionProps {
  className?: string;
}

export type ActiveTab = 'popular' | 'slot' | 'live' | 'fast' | 'all';

export const MainCarouselSection: FC<MainCarouselSectionProps> = ({ className }) => {
  const { t } = useTranslation('home');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const carouselData = useMemo(() => getCarouselData(t), [t]);
  const tabs = useMemo(() => getCategoryTabs(t, activeTab), [t, activeTab]);

  const handleTabChange = (value: string): void => {
    setActiveTab(value as ActiveTab);
  };

  return (
    <div className={className ?? ''}>
      <CategoryFiltersBar className={styles.categoryFiltersBar} tabs={tabs} onTabChange={handleTabChange} />

      {activeTab === 'all' && (
        <div className={styles.caruseles}>
          {carouselData.map(item => (
            <Carousel key={item.id} icon={item.icon} title={item.title} items={item.id} />
          ))}
        </div>
      )}
    </div>
  );
};
