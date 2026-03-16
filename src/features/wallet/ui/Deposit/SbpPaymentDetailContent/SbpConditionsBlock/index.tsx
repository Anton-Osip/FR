import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Notice } from '@shared/ui';

import styles from './SbpConditionsBlock.module.scss';

export const SbpConditionsBlock: FC = () => {
  const { t } = useTranslation('walletModal');

  return (
    <div className={styles.container}>
      <h3 className={styles.subtitle}>{t('sbpConditions.title')}</h3>

      <div className={styles.noticeWrapper}>
        <Notice variant={'warning'} text={t('sbpConditions.notices.singlePayment')} />
        <Notice variant={'warning'} text={t('sbpConditions.notices.noComments')} />
        <Notice variant={'warning'} text={t('sbpConditions.notices.requisitesChange')} />
      </div>

      <p className={styles.description}>{t('sbpConditions.description')}</p>
    </div>
  );
};
