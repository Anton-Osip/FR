import { FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { AdaptiveSection } from '@shared/ui';
import { CalendarIcon, GraphIcon, PercentageCircleIcon, WalletIcon } from '@shared/ui/icons';

import styles from './ProgramTerms.module.scss';

interface ProgramTermsProps {
  className?: string;
}
const SLIDER_BREAKPOINT = 1500;

export const ProgramTerms: FC<ProgramTermsProps> = ({ className }) => {
  const { t } = useTranslation('invite');

  const cardsData = useMemo(
    () => [
      {
        id: 1,
        title: t('programTerms.cards.firstDeposit.title'),
        description: t('programTerms.cards.firstDeposit.description'),
        icon: <WalletIcon />,
      },
      {
        id: 2,
        title: t('programTerms.cards.ggrBonus.title'),
        description: t('programTerms.cards.ggrBonus.description'),
        icon: <GraphIcon />,
      },
      {
        id: 3,
        title: t('programTerms.cards.profitPercent.title'),
        description: t('programTerms.cards.profitPercent.description'),
        icon: <PercentageCircleIcon />,
      },
      {
        id: 4,
        title: t('programTerms.cards.weeklyPayments.title'),
        description: t('programTerms.cards.weeklyPayments.description'),
        icon: <CalendarIcon />,
      },
    ],
    [t],
  );

  return (
    <div className={clsx(styles.programTerms, className)}>
      <AdaptiveSection
        className={className}
        title={t('programTerms.title')}
        data={cardsData}
        renderItem={card => (
          <div key={card.id} className={styles.card}>
            <div className={styles.image}>{card.icon}</div>
            <h4 className={styles.cardTitle}>{card.title}</h4>
            <p className={styles.description}>{card.description}</p>
          </div>
        )}
        breakpoint={SLIDER_BREAKPOINT}
        swiperBreakpoints={{
          864: { spaceBetween: 16 },
        }}
      />
    </div>
  );
};
