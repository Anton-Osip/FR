import { type FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { AdaptiveSection } from '@shared/ui';

import { getBenefitsData } from './constants/constants';
import { TierBenefitsCard } from './TierBenefitsCard';

interface BenefitsSectionProps {
  className?: string;
}

const SLIDER_BREAKPOINT = 1508;

export const BenefitsSection: FC<BenefitsSectionProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const benefitsData = useMemo(() => getBenefitsData(t), [t]);

  return (
    <AdaptiveSection
      className={clsx(className)}
      title={t('benefitsSection.title')}
      data={benefitsData}
      renderItem={card => <TierBenefitsCard card={card} />}
      breakpoint={SLIDER_BREAKPOINT}
      swiperBreakpoints={{
        864: { spaceBetween: 16 },
      }}
    />
  );
};
