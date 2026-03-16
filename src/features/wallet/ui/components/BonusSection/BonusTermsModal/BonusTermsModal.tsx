import { FC, type ReactNode, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Modal, Notice } from '@shared/ui';

import styles from './BonusTermsModal.module.scss';

import type { DepositCampaignStep } from '@features/bonus/model';

const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;
const DEFAULT_PERCENT = 50;

interface Props {
  trigger?: ReactNode;
  step?: DepositCampaignStep | null;
}

function formatWageringTime(seconds: number, t: (key: string, opts?: Record<string, number>) => string): string {
  const hours = Math.round(seconds / SECONDS_PER_HOUR);

  if (hours >= HOURS_PER_DAY) {
    const days = Math.round(hours / HOURS_PER_DAY);

    return t('bonusTermsModal.wageringTimeDays', { count: days });
  }

  return t('bonusTermsModal.wageringTimeHours', { count: hours });
}

export const BonusTermsModal: FC<Props> = ({ trigger, step }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('walletModal');

  const terms = useMemo(() => {
    const percent = step ? Number(step.reward_percent) : DEFAULT_PERCENT;
    const conditions = step?.conditions;

    return {
      percent,
      wager: conditions?.wager_multiplier ? `x${conditions.wager_multiplier}` : t('bonusTermsModal.wagerValue'),
      wageringTime: conditions?.activation_ttl_sec
        ? formatWageringTime(conditions.activation_ttl_sec, t)
        : t('bonusTermsModal.wageringTimeValue'),
      usageTime: conditions?.usage_ttl_sec
        ? formatWageringTime(conditions.usage_ttl_sec, t)
        : t('bonusTermsModal.wageringTimeValue'),
      maxWin: conditions?.withdraw_cap_multiplier
        ? t('bonusTermsModal.maxWinValueMultiplier', { multiplier: conditions.withdraw_cap_multiplier })
        : t('bonusTermsModal.maxWinValue'),
    };
  }, [step, t]);

  return (
    <Modal
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      showCloseButton
      overlayClassName={styles.overlay}
      contentClassName={styles.content}
      bodyClassName={styles.body}
      closeButtonClassName={styles.closeButton}
      headerClassName={styles.headerClassName}
      title={
        <header className={styles.header}>
          <h3 className={styles.title}>{t('bonusTermsModal.title', { percent: terms.percent })}</h3>
        </header>
      }
    >
      <>
        <div className={styles.infoWrapper}>
          <div className={styles.item}>
            <h3 className={styles.title}>{t('bonusTermsModal.wager')}</h3>
            <p className={styles.value}>{terms.wager}</p>
          </div>

          <div className={styles.item}>
            <h3 className={styles.title}>{t('bonusTermsModal.wageringTime')}</h3>
            <p className={styles.value}>{terms.wageringTime}</p>
          </div>

          {step?.conditions?.usage_ttl_sec && (
            <div className={styles.item}>
              <h3 className={styles.title}>{t('bonusTermsModal.usageTime')}</h3>
              <p className={styles.value}>{terms.usageTime}</p>
            </div>
          )}
          <div className={styles.item}>
            <h3 className={styles.title}>{t('bonusTermsModal.maxWin')}</h3>
            <p className={styles.value}>{terms.maxWin}</p>
          </div>
        </div>

        <div className={styles.infoNotes}>
          <h2 className={styles.title}>{t('bonusTermsModal.attention')}</h2>

          <Notice
            text={t('bonusTermsModal.notices.onlySomeGames')}
            tooltip={t('bonusTermsModal.notices.availableGames')}
          />

          <Notice text={t('bonusTermsModal.notices.bonusExpiry')} />
        </div>

        <Button variant={'primary'} fullWidth onClick={() => setOpen(false)}>
          {t('bonusTermsModal.close')}
        </Button>
      </>
    </Modal>
  );
};
