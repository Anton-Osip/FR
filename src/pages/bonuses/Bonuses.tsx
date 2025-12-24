import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui';

import { BenefitsSection } from '@widgets/benefitsSection';
import { CashbackCard, PromoCodeCard, RankCard } from '@widgets/bonusesPromo';

import styles from './Bonuses.module.scss';

export const Bonuses: FC = () => {
  const { t } = useTranslation('breadcrumbs');

  const breadCrumbsItems = useMemo(() => [{ label: t('pages.bonuses') }], [t]);

  return (
    <div className={styles.bonuses}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <div className={styles.promoGrid}>
        <RankCard />
        <PromoCodeCard />
        <CashbackCard />
      </div>
      <BenefitsSection />
    </div>
  );
};
