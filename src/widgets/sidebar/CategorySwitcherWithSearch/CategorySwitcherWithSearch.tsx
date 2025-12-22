import { type FC } from 'react';

import { Button } from '@shared/ui';
import { SearchIcon } from '@shared/ui/icons';

import { SearchModal } from '@widgets/searchModal';

import styles from './CategorySwitcherWithSearch.module.scss';

interface CategorySwitcherWithSearchProps {
  isOpen: boolean;
  className?: string;
}

export const CategorySwitcherWithSearch: FC<CategorySwitcherWithSearchProps> = ({ isOpen, className }) => {
  return (
    <div className={`${styles.root} ${isOpen ? '' : styles.isOpen} ${className ? className : ''}`}>
      {/*<Button className={styles.casinoButton} variant={'primary'} size={'m'} fullWidth>Казино</Button>*/}
      {/*<Button className={styles.sportButton} variant={'secondary'} size={'m'} fullWidth>Спорт</Button>*/}
      <SearchModal
        trigger={
          <Button className={styles.searchButton} variant={'secondary'} size={'m'}>
            <span className={styles.searchIcon}>{<SearchIcon />}</span>
            <span className={styles.searchLabel}>Поиск</span>
          </Button>
        }
      />
    </div>
  );
};
