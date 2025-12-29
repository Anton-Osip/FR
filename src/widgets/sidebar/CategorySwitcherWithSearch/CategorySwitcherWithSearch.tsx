import { type FC, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { SearchIcon } from '@shared/ui/icons';

import { SearchModal } from '@widgets/searchModal';

import styles from './CategorySwitcherWithSearch.module.scss';

interface CategorySwitcherWithSearchProps {
  isOpen: boolean;
  className?: string;
}

export const CategorySwitcherWithSearch: FC<CategorySwitcherWithSearchProps> = ({ isOpen, className }) => {
  const { t } = useTranslation('sidebar');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className={`${styles.root} ${isOpen ? '' : styles.isOpen} ${className ? className : ''}`}>
      {/*<Button className={styles.casinoButton} variant={'primary'} size={'m'} fullWidth>Казино</Button>*/}
      {/*<Button className={styles.sportButton} variant={'secondary'} size={'m'} fullWidth>Спорт</Button>*/}
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        trigger={
          <Button className={styles.searchButton} variant={'secondary'} size={'m'}>
            <span className={styles.searchIcon}>{<SearchIcon />}</span>
            <span className={styles.searchLabel}>{t('search')}</span>
          </Button>
        }
      />
    </div>
  );
};
