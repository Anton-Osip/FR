import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import styles from './BenefitsSection.module.scss';
import { getBenefitsData } from './constants/constants';
import { TierBenefitsCard } from './TierBenefitsCard';

export const BenefitsSection: FC = () => {
  const { t } = useTranslation('bonuses');
  const benefitsData = useMemo(() => getBenefitsData(t), [t]);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>{t('benefitsSection.title')}</h2>
      <div className={styles.grid}>
        {benefitsData.map(card => {
          return <TierBenefitsCard key={card.id} card={card} />;
        })}
      </div>
    </section>
  );
};
