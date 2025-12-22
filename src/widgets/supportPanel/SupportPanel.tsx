import { type FC } from 'react';

import { Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import styles from './SupportPanel.module.scss';

export const SupportPanel: FC = () => {
  return (
    <div className={styles.supportPanel}>
      <Button size={'s'} variant={'tertiary'} className={styles.button}>
        <span className={styles.buttonContainer}>
          <span className={styles.buttonLabel}>Новости</span>
          <span className={styles.buttonChevron}>
            <ChevronHeaderIcon />
          </span>
        </span>
      </Button>
      <Button size={'s'} variant={'tertiary'} className={styles.button}>
        <span className={styles.buttonContainer}>
          <span className={styles.buttonLabel}>Чат</span>
          <span className={styles.buttonChevron}>
            <ChevronHeaderIcon />
          </span>
        </span>
      </Button>
      <Button size={'s'} variant={'tertiary'} className={styles.button}>
        <span className={styles.buttonContainer}>
          <span className={styles.buttonLabel}>Соглашение</span>
          <span className={styles.buttonChevron}>
            <ChevronHeaderIcon />
          </span>
        </span>
      </Button>
      <Button size={'s'} variant={'tertiary'} className={styles.button}>
        <span className={styles.buttonContainer}>
          <span className={styles.buttonLabel}>Поддержка</span>
          <span className={styles.buttonChevron}>
            <ChevronHeaderIcon />
          </span>
        </span>
      </Button>
    </div>
  );
};
