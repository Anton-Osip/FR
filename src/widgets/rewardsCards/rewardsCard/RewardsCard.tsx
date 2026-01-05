import { useState, type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button, Input } from '@shared/ui';

import styles from './RewardsCard.module.scss';

interface RewardsCardProps {
  className?: string;
}

export const RewardsCard: FC<RewardsCardProps> = ({ className }) => {
  const { t } = useTranslation('invite');
  const [inputValue, setInputValue] = useState<string>('t.me/frosted?start=567558');

  return (
    <div className={clsx(styles.rewardsCard, className)}>
      <div className={styles.info}>
        <h3 className={styles.title}>
          {t('rewardsCards.title')} <br /> {t('rewardsCards.titleSecondLine')}
        </h3>
        <p className={styles.description}>{t('rewardsCards.description')}</p>
      </div>
      <div className={styles.inputWrapper}>
        <Input className={styles.input} value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <Button className={styles.button}>{t('rewardsCards.inviteButton')}</Button>
      </div>
    </div>
  );
};
