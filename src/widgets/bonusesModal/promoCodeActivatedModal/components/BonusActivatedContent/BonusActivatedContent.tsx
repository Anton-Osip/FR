import { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/config';
import { Button } from '@shared/ui';

import { BonusInfoItem, PromoCodeInput } from '../common';

import styles from './BonusActivatedContent.module.scss';

import { BonusRedeemResponseWeb } from '@features/bonus';

interface BonusActivatedContentProps {
  data: BonusRedeemResponseWeb;
  onClose?: () => void;
}

export const BonusActivatedContent: FC<BonusActivatedContentProps> = ({ data, onClose }) => {
  const { t } = useTranslation('promoCodeActivatedModal');
  const navigate = useNavigate();

  const handleGoToGame = (): void => {
    onClose?.();
    navigate(APP_PATH.main);
  };

  return (
    <div className={styles.content}>
      <PromoCodeInput code={data.code} />

      <div className={styles.bonusInfo}>
        <BonusInfoItem label={t('bonusAmount')} value={data.amount} />
        <BonusInfoItem label={t('wager')} value={`x${data.wager_mult}`} />
        <BonusInfoItem label={t('wagerPeriod')} value={t('days', { count: data.wager_ttl_days })} />
      </div>

      <Button variant="primary" size="m" fullWidth onClick={handleGoToGame}>
        {t('goToGame')}
      </Button>
    </div>
  );
};
