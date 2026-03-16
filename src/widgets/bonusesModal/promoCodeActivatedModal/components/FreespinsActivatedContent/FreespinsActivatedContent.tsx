import { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/config';
import { formatLocalizedDateTime } from '@shared/lib';
import { Button } from '@shared/ui';

import { BonusInfoItem, PromoCodeInput } from '../common';
import { SlotInfo } from '../SlotInfo';

import styles from './FreespinsActivatedContent.module.scss';

import { FreespinsRedeemResponseWeb } from '@features/bonus';

interface FreespinsActivatedContentProps {
  data: FreespinsRedeemResponseWeb;
  onClose?: () => void;
}

export const FreespinsActivatedContent: FC<FreespinsActivatedContentProps> = ({ data, onClose }) => {
  const { t } = useTranslation('promoCodeActivatedModal');
  const navigate = useNavigate();

  const handleGoToSlot = (): void => {
    onClose?.();
    if (data.slot) {
      const gamePath = APP_PATH.slot.replace(':id', data.slot.uuid);

      navigate(gamePath);
    } else {
      navigate(APP_PATH.main);
    }
  };

  return (
    <div className={styles.content}>
      <PromoCodeInput code={data.code} />

      {data.slot && <SlotInfo slot={data.slot} onClose={onClose} />}

      <div className={styles.bonusInfo}>
        <BonusInfoItem label={t('freespinsCount')} value={data.quantity} hidden={typeof data.quantity !== 'number'} />
        <BonusInfoItem label={t('denomination')} value={data.denomination} hidden={!data.denomination} />
        <BonusInfoItem label={t('wager')} value={`x${data.wager_mult}`} hidden={data.wager_mult === null} />
        <BonusInfoItem
          label={t('wagerPeriod')}
          value={data.wager_ttl_days !== null ? t('days', { count: data.wager_ttl_days }) : ''}
          hidden={data.wager_ttl_days === null}
        />
        <BonusInfoItem
          label={t('validUntil')}
          value={data.valid_until ? formatLocalizedDateTime(data.valid_until) : ''}
          hidden={!data.valid_until}
        />
      </div>

      <Button variant="primary" size="m" fullWidth onClick={handleGoToSlot}>
        {t('goToSlot')}
      </Button>
    </div>
  );
};
