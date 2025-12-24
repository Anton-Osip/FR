import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input, Modal, Tabs } from '@shared/ui';
import { FireIcon, FlashIcon, MicrophoneIcon, RepeatIcon, SearchIcon, SevenIcon, WindowIcon } from '@shared/ui/icons';
import type { Tab } from '@shared/ui/tabs/Tabs';

import img3 from '../../assets/images/popular/3030066f70f536d8c0c12cb6501a6862d3e7cd59.png';
import img1 from '../../assets/images/popular/86d5f1c89786c6066397373ee520557bcf2f6342.png';
import img2 from '../../assets/images/popular/db08f947f8ba82b0fef1c3ae9cf9001d61cdf89f.jpg';

import styles from './SearchModal.module.scss';

interface SearchModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const GAMES_DATA = [
  { id: 1, img: img1 },
  { id: 2, img: img2 },
  { id: 3, img: img3 },
  { id: 4, img: img1 },
  { id: 5, img: img2 },
  { id: 6, img: img3 },
  { id: 7, img: img1 },
  { id: 8, img: img2 },
  { id: 9, img: img3 },
  { id: 10, img: img1 },
  { id: 11, img: img2 },
  { id: 12, img: img3 },
  { id: 13, img: img1 },
  { id: 14, img: img2 },
  { id: 15, img: img3 },
  { id: 16, img: img3 },
  { id: 17, img: img3 },
  { id: 18, img: img3 },
  { id: 19, img: img3 },
  { id: 20, img: img3 },
  { id: 21, img: img3 },
  { id: 22, img: img3 },
  { id: 23, img: img3 },
  { id: 24, img: img3 },
  { id: 25, img: img3 },
  { id: 26, img: img3 },
  { id: 27, img: img3 },
  { id: 28, img: img3 },
  { id: 29, img: img3 },
  { id: 30, img: img3 },
  { id: 31, img: img3 },
  { id: 32, img: img3 },
  { id: 33, img: img3 },
  { id: 34, img: img3 },
];

export const SearchModal: FC<SearchModalProps> = ({ trigger, open, onOpenChange }) => {
  const { t } = useTranslation('searchModal');
  const [activeTab, setActiveTab] = useState<string>('all');

  const initialTabs: Omit<Tab, 'active'>[] = useMemo(
    () => [
      {
        id: '1',
        value: 'all',
        label: t('allGames'),
        icon: <WindowIcon />,
      },
      {
        id: '2',
        value: 'popular',
        label: t('popular'),
        icon: <FireIcon />,
      },
      {
        id: '3',
        value: 'slots',
        label: t('slots'),
        icon: <SevenIcon />,
      },
      {
        id: '4',
        value: 'liveGames',
        label: t('liveGames'),
        icon: <MicrophoneIcon />,
      },
      {
        id: '5',
        value: 'flashGames',
        label: t('quickGames'),
        icon: <FlashIcon />,
      },
    ],
    [t],
  );

  const tabs: Tab[] = useMemo(
    () => initialTabs.map(tab => ({ ...tab, active: tab.value === activeTab })),
    [initialTabs, activeTab],
  );

  const activeTabData = useMemo(() => {
    return initialTabs.find(tab => tab.value === activeTab) || initialTabs[0];
  }, [initialTabs, activeTab]);

  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  const shownCount = 60;
  const totalCount = 90;

  return (
    <Modal trigger={trigger} open={open} onOpenChange={onOpenChange} title={t('title')} contentClassName={styles.modal}>
      <div className={styles.body}>
        <div className={styles.searchWrapper}>
          <Input icon={<SearchIcon />} placeholder={t('placeholder')} />
          <Tabs size={'m'} items={tabs} onChange={handleTabChange} className={styles.tabs} />
        </div>

        <div className={styles.games}>
          <header className={styles.header}>
            <div className={styles.tabIcon}>{activeTabData.icon}</div>
            <h3 className={styles.tabTitle}>{activeTabData.label}</h3>
          </header>
          <div className={styles.slots}>
            <div className={styles.grid}>
              {GAMES_DATA.map(g => (
                <div className={styles.imageWrapper} key={g.id}>
                  <img src={g.img} alt="img" />
                </div>
              ))}
            </div>
            <div className={styles.more}>
              <p className={styles.text}>
                {t('shown')}: {shownCount} {t('of')} {totalCount}
              </p>
              <Button variant={'tertiary'} size={'s'} icon={<RepeatIcon />}>
                {t('showMore')}
              </Button>
            </div>
          </div>
        </div>
        <footer className={styles.footer}>
          <p className={styles.text}>
            {t('shown')}: {shownCount} {t('of')} {totalCount}
          </p>
          <Button variant={'tertiary'} size={'s'} icon={<RepeatIcon />}>
            {t('showMore')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};
