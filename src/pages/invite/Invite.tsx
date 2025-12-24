import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui/breadcrumbs';

import { ProgramTerms } from '@widgets/programTerms';
import { RatingTable } from '@widgets/ratingTable';
import { RewardsCards } from '@widgets/rewardsCards';

import styles from './Invite.module.scss';

export const Invite: FC = () => {
  const { t: tBreadcrumbs } = useTranslation('breadcrumbs');

  const breadCrumbsItems = useMemo(() => [{ label: tBreadcrumbs('pages.invite') }], [tBreadcrumbs]);

  return (
    <div className={styles.invite}>
      <Breadcrumbs items={breadCrumbsItems} className={styles.breadcrumbs} />
      <RewardsCards className={styles.rewardsCards} />
      <ProgramTerms />
      <RatingTable />
    </div>
  );
};
