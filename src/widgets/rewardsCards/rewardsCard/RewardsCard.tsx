import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@shared/lib';
import { Button } from '@shared/ui';

import rewardsCardIcon from '../../../shared/assets/icons/rewardsCardIcon.svg?url';

import styles from './RewardsCard.module.scss';

interface RewardsCardProps {
  className?: string;
}

export const RewardsCard: FC<RewardsCardProps> = ({ className }) => {
  const { t } = useTranslation('invite');
  const value = 't.me/frosted?start=567558';

  const handleCopy = async (): Promise<void> => {
    await copyToClipboard(value, `Ссылка для приглашения скопирована!`, 'Поделитесь ею с другом');
  };

  return (
    <div className={clsx(styles.rewardsCard, className)}>
      <div className={styles.info}>
        <h3 className={styles.title}>
          {t('rewardsCards.title')} <br /> {t('rewardsCards.titleSecondLine')}
        </h3>
        <p className={styles.description}>{t('rewardsCards.description')}</p>
      </div>
      <div className={styles.inputWrapper}>
        <div className={styles.inputContent}>
          <span className={styles.input}>{value}</span>
        </div>
        <Button className={styles.button} onClick={handleCopy}>
          {t('rewardsCards.inviteButton')}
        </Button>
      </div>
      <div className={styles.image}>
        <img src={rewardsCardIcon} alt="animation" />
      </div>
    </div>
  );
};
