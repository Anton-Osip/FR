import { type FC } from 'react';

import { Breadcrumbs } from '@shared/ui/breadcrumbs';

import { BenefitsSection } from '@widgets/benefitsSection';
import { CashbackCard, PromoCodeCard, RankCard } from '@widgets/bonusesPromo';

import styles from './Bonuses.module.scss';

const breadCrumbsItems = [{ label: 'Бонусы' }];

export const Bonuses: FC = () => {
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
