import { type FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@shared/ui';

import styles from './Invite.module.scss';

import { ProgramTerms, RatingTable, RewardsCards } from '@/widgets';

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
