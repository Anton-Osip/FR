import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { formatLocalizedDateTime } from '@shared/lib';
import { Button } from '@shared/ui';

import { BonusInfoItem, PromoCodeInput } from '../common';
import { SlotInfo } from '../SlotInfo';

import styles from './DepositFreespinsContent.module.scss';

import { DepositReserveFreespinsWeb } from '@features/bonus';

interface DepositFreespinsContentProps {
  data: DepositReserveFreespinsWeb;
  onClose?: () => void;
}

export const DepositFreespinsContent: FC<DepositFreespinsContentProps> = ({ data, onClose }) => {
  const { t } = useTranslation('promoCodeActivatedModal');

  const handleGoToDeposit = (): void => {
    onClose?.();
    // TODO: Implement navigation to deposit page when route is available
    window.location.href = '/deposit';
  };

  return (
    <div className={styles.content}>
      <PromoCodeInput code={data.code} />

      {data.freespins.slot && <SlotInfo slot={data.freespins.slot} onClose={onClose} />}

      <div className={styles.bonusInfo}>
        <BonusInfoItem label={t('freespinsCount')} value={data.freespins.quantity} />
        <BonusInfoItem
          label={t('denomination')}
          value={data.freespins.denomination}
          hidden={!data.freespins.denomination}
        />
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
