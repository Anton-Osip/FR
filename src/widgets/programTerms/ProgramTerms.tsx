import { FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { CalendarIcon, GraphIcon, PercentageCircleIcon, WalletIcon } from '@shared/ui/icons';

import styles from './ProgramTerms.module.scss';

interface ProgramTermsProps {
  className?: string;
}

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
      <h2 className={styles.title}>{t('programTerms.title')}</h2>
      <div className={styles.grid}>
        {cardsData.map(card => (
          <div key={card.id} className={styles.card}>
            <div className={styles.image}>{card.icon}</div>
            <h4 className={styles.cardTitle}>{card.title}</h4>
            <p className={styles.description}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
