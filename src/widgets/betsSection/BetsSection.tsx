import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Tabs } from '@shared/ui';
import { Dropdown } from '@shared/ui/dropdown/Dropdown.tsx';

import { BettingTable } from '@widgets/bettingTable';
import { TABLE_DATA } from '@widgets/bettingTable/mockTable.tsx';

import styles from './BetsSection.module.scss';

const selectItems = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '40', label: '40' },
  { value: '50', label: '50' },
];

export const BetsSection: FC = () => {
  const { t } = useTranslation('home');

  const tabsItems = useMemo(
    () => [
      {
        id: 'lastBets',
        value: 'lastBets',
        label: t('betsSection.tabs.lastBets'),
        active: true,
      },
      {
        id: 'myBets',
        value: 'myBets',
        label: t('betsSection.tabs.myBets'),
        active: false,
      },
      {
        id: 'bigPlayers',
        value: 'bigPlayers',
        label: t('betsSection.tabs.bigPlayers'),
        active: false,
      },
    ],
    [t],
  );

  return (
    <section className={styles.betsSection}>
      <div className={styles.tableFilter}>
        <h4 className={styles.title}>{t('betsSection.title')}</h4>
        <div className={styles.wrapper}>
          <Tabs items={tabsItems} size="s" className={styles.tabs} />
          <div className={styles.dropdownWrapper}>
            <Dropdown value="10" options={selectItems} onChange={() => {}} />
          </div>
        </div>
      </div>

      <BettingTable items={TABLE_DATA} />
    </section>
  );
};
