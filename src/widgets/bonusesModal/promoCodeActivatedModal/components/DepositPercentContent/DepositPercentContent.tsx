import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { formatLocalizedDateTime } from '@shared/lib';
import { Button } from '@shared/ui';

import { BonusInfoItem, PromoCodeInput } from '../common';

import styles from './DepositPercentContent.module.scss';

import { DepositReservePercentWeb } from '@features/bonus';

interface DepositPercentContentProps {
  data: DepositReservePercentWeb;
  onClose?: () => void;
}

export const DepositPercentContent: FC<DepositPercentContentProps> = ({ data, onClose }) => {
  const { t } = useTranslation('promoCodeActivatedModal');

  const handleGoToDeposit = (): void => {
    onClose?.();
    // TODO: Implement navigation to deposit page when route is available
    window.location.href = '/deposit';
  };

  return (
    <div className={styles.content}>
      <PromoCodeInput code={data.code} />

      <div className={styles.bonusInfo}>
        <BonusInfoItem label={t('bonusPercent')} value={`+${data.percent}%`} />
        <BonusInfoItem label={t('minDeposit')} value={data.min_deposit} hidden={data.min_deposit === null} />
        <BonusInfoItem
          label={t('availableUntil')}
          value={data.deadline_ts ? formatLocalizedDateTime(data.deadline_ts) : ''}
          hidden={!data.deadline_ts}
        />
        <BonusInfoItem label={t('wager')} value={`x${data.wager_mult}`} />
        <BonusInfoItem label={t('wagerPeriod')} value={t('days', { count: data.wager_ttl_days })} />
      </div>

      <Button variant="primary" size="m" fullWidth onClick={handleGoToDeposit}>
        {t('goToDeposit')}
      </Button>
    </div>
  );
};
