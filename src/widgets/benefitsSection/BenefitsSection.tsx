import { type FC } from 'react';

import styles from './BenefitsSection.module.scss';
import { BENEFITS_DATA } from './constants/constants';
import { TierBenefitsCard } from './TierBenefitsCard';

export const BenefitsSection: FC = () => {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Ранги</h2>
      <div className={styles.grid}>
        {BENEFITS_DATA.map(card => {
          return <TierBenefitsCard key={card.id} card={card} />;
        })}
      </div>
    </section>
  );
};
