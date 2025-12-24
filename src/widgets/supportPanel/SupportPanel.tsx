import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import styles from './SupportPanel.module.scss';

export const SupportPanel: FC = () => {
  const { t } = useTranslation('profile');

  const buttons = useMemo(
    () => [
      { id: 'news', label: t('supportPanel.news') },
      { id: 'chat', label: t('supportPanel.chat') },
      { id: 'agreement', label: t('supportPanel.agreement') },
      { id: 'support', label: t('supportPanel.support') },
    ],
    [t],
  );

  return (
    <div className={styles.supportPanel}>
      {buttons.map(button => (
        <Button key={button.id} size={'s'} variant={'tertiary'} className={styles.button}>
          <span className={styles.buttonContainer}>
            <span className={styles.buttonLabel}>{button.label}</span>
            <span className={styles.buttonChevron}>
              <ChevronHeaderIcon />
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
};
