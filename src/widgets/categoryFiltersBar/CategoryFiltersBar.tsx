import { type FC, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button, Input, Tabs } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { SearchIcon } from '@shared/ui/icons';

import styles from './CategoryFiltersBar.module.scss';

import { SearchModal } from '@/widgets';

interface CategoryFiltersBarProps {
  className?: string;
  tabs: Tab[];
  onTabChange: (value: string) => void;
}

export const CategoryFiltersBar: FC<CategoryFiltersBarProps> = ({ className, tabs, onTabChange }) => {
  const { t } = useTranslation('home');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.buttonWrapper}>
        <SearchModal
          open={isSearchModalOpen}
          onOpenChange={setIsSearchModalOpen}
          trigger={
            <Button variant={'secondary'}>
              <SearchIcon />
            </Button>
          }
        />
      </div>
      <div className={styles.tabs}>
        <Tabs items={tabs} onChange={onTabChange} size={'m'} />
      </div>
      <div className={`${styles.inputWrapper}`}>
        <Input icon={<SearchIcon />} placeholder={t('categoryFiltersBar.searchPlaceholder')} />
      </div>
    </div>
  );
};
