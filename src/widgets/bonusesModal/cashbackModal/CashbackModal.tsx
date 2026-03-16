import { CSSProperties, FC, ReactNode, useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import bonusesHeaderMonthlyBg from '@shared/assets/icons/BonusesHeaderMonthlyBg.svg?url';
import bonusesHeaderWeeklyBg from '@shared/assets/icons/BonusesHeaderWeeklyBg.svg?url';
import { formatHours, getCurrencySymbol } from '@shared/lib';
import { Button, Modal } from '@shared/ui';

import styles from './CashbackModal.module.scss';

import { CashbackResponse } from '@features/bonus';

type CashbackPeriod = 'monthly' | 'weekly';

interface CashbackModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  cashbackPeriod: CashbackPeriod;
  cashbackData: CashbackResponse | undefined;
}

export const CashbackModal: FC<CashbackModalProps> = ({
  trigger,
  open,
  onOpenChange,
  cashbackPeriod,
  cashbackData,
}) => {
  const { t, i18n } = useTranslation('bonuses');
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean): void => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChange],
  );

  if (!cashbackData) return;

  return (
    <Modal
      title={
        <header
          className={styles.header}
          style={
            {
              '--image-url': `url(${cashbackPeriod === 'weekly' ? bonusesHeaderWeeklyBg : bonusesHeaderMonthlyBg})`,
            } as CSSProperties
          }
        >
          <h3 className={styles.title}>
            {t(`cashbackModal.${cashbackPeriod}.title`, { count: Number(cashbackData[cashbackPeriod].percent) })}
          </h3>
        </header>
      }
      trigger={trigger}
      headerClassName={styles.modalHeader}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
    >
      <div className={styles.container}>
        <div className={styles.body}>
          <div className={styles.item}>
            <h4 className={styles.title}>{t('cashbackModal.fields.period')}</h4>
            <p className={styles.description}>{t(`cashbackCard.${cashbackPeriod}`)}</p>
          </div>
          <div className={styles.item}>
            <h4 className={styles.title}>{t('cashbackModal.fields.minRank')}</h4>
            <p className={styles.description}>
              {t(`cashbackModal.ranks.${cashbackData[cashbackPeriod].required_rank}`)}
            </p>
          </div>
          {cashbackData[cashbackPeriod].claimable?.wager && (
            <div className={styles.item}>
              <h4 className={styles.title}>{t('cashbackModal.fields.wager')}</h4>
              <p className={styles.description}>{`${cashbackData[cashbackPeriod].claimable.wager}%`}</p>
            </div>
          )}
          {cashbackData[cashbackPeriod].claimable?.playtime_hours && (
            <div className={styles.item}>
              <h4 className={styles.title}>{t('cashbackModal.fields.hours')}</h4>
              <p className={styles.description}>
                {formatHours(cashbackData[cashbackPeriod].claimable.playtime_hours, i18n.language)}
              </p>
            </div>
          )}
          {cashbackData[cashbackPeriod].claimable && (
            <div className={styles.item}>
              <h4 className={styles.title}>{t('cashbackModal.fields.balanceType')}</h4>
              <p className={styles.description}>
                {`${cashbackData[cashbackPeriod].claimable.amount} 
                ${getCurrencySymbol(cashbackData[cashbackPeriod].claimable.currency)}`}
              </p>
            </div>
          )}
        </div>
        <footer className={styles.footer}>
          <Button variant={'primary'} size={'m'} fullWidth onClick={() => handleOpenChange(false)}>
            {t('cashbackModal.closeButton')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};
