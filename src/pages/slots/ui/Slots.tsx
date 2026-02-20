import { type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { BetsSection } from '@widgets/betsSection';
import { SlotsHeader } from '@widgets/slotsHeader';
import { SlotsHeroHeader } from '@widgets/slotsHeroHeader';
import { SlotsSection } from '@widgets/slotsSection';

import styles from './Slots.module.scss';

import { SLOTS_HEADER_TYPES, type SlotsHeaderType } from '@/widgets/slotsHeader/constants';

const isValidSlotsHeaderType = (value: string | undefined): value is SlotsHeaderType => {
  if (!value) return false;

  return SLOTS_HEADER_TYPES.includes(value as SlotsHeaderType);
};

export const Slots: FC = () => {
  const { type } = useParams();
  const validType = isValidSlotsHeaderType(type) ? type : undefined;

  const { t } = useTranslation('slots');
  const headerType: SlotsHeaderType = validType ?? 'allGames';
  const title = t(`header.${headerType}`);

  return (
    <div className={styles.slots}>
      <SlotsHeroHeader validType={validType} title={title} />
      <SlotsHeader className={styles.slotsHeader} title={title} />
      <SlotsSection type={validType} className={styles.slotsSection} />

      <BetsSection page={'games'} />
    </div>
  );
};
