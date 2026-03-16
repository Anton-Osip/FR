import { FC, ReactElement, type ReactNode, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { getCurrencySymbol } from '@shared/lib/formatting';
import { Button, Modal, Notice } from '@shared/ui';

import styles from './BonusTermsModal/BonusTermsModal.module.scss';

import { PromoDeposit } from '@features/bonus/model/types';

interface Props {
  trigger?: ReactNode;
  promoDeposit?: PromoDeposit | null;
}

const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;
const MILLISECONDS_IN_SECOND = 1000;

function formatWageringTime(seconds: number, t: (key: string, opts?: Record<string, number>) => string): string {
  const hours = Math.round(seconds / SECONDS_PER_HOUR);

  if (hours >= HOURS_PER_DAY) {
    const days = Math.round(hours / HOURS_PER_DAY);

    return t('bonusTermsModal.wageringTimeDays', { count: days });
  }

  return t('bonusTermsModal.wageringTimeHours', { count: hours });
}

function formatDeadline(deadlineTs: number | string, languageFromI18n: string | undefined): string {
  const timestamp = typeof deadlineTs === 'string' ? Number(deadlineTs) : deadlineTs;
  const date = new Date(timestamp * MILLISECONDS_IN_SECOND);

  if (!timestamp || isNaN(timestamp)) {
    return '';
  }

  const language = (languageFromI18n || 'ru').toLowerCase();

  let locale: string;

  if (language.startsWith('en')) {
    locale = 'en-US';
  } else {
    locale = 'ru-RU';
  }

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PromoDepositTermsModal: FC<Props> = ({ trigger, promoDeposit }) => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation('walletModal');

  const terms = useMemo(() => {
    if (!promoDeposit) {
      return null;
    }

    const rewardType = promoDeposit.reward_type;
    const wagerMult = promoDeposit.wager_mult ? `x${promoDeposit.wager_mult}` : t('bonusTermsModal.wagerValue');

    let wageringTime = t('bonusTermsModal.wageringTimeValue');

    if (promoDeposit.wager_ttl_days) {
      wageringTime = t('bonusTermsModal.wageringTimeDays', { count: promoDeposit.wager_ttl_days });
    } else if (promoDeposit.expires_in_sec) {
      const expiresInSec =
        typeof promoDeposit.expires_in_sec === 'string'
          ? Number(promoDeposit.expires_in_sec)
          : promoDeposit.expires_in_sec;

      wageringTime = formatWageringTime(expiresInSec, t);
    }

    let deadline = null;

    if (promoDeposit.deadline_ts) {
      deadline = formatDeadline(promoDeposit.deadline_ts, i18n.language);
    }

    let rewardValue = '';

    if (rewardType === 'funds' && promoDeposit.amount) {
      const currencySymbol = getCurrencySymbol(promoDeposit.currency);

      rewardValue = `${promoDeposit.amount} ${currencySymbol}`.trim();
    } else if (rewardType === 'percent' && promoDeposit.percent) {
      rewardValue = `+${promoDeposit.percent}%`;
    } else if (rewardType === 'freespins') {
      rewardValue = t('bonus.promoCodeReward');
    }

    return {
      rewardType,
      rewardValue,
      wager: wagerMult,
      wageringTime,
      deadline,
      minDeposit: promoDeposit.min_deposit,
      currency: promoDeposit.currency,
    };
  }, [i18n.language, promoDeposit, t]);

  if (!terms) {
    return trigger as ReactElement;
  }

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
          <h3 className={styles.title}>{t('bonus.promoCodeReward')}</h3>
        </header>
      }
    >
      <>
        <div className={styles.infoWrapper}>
          {terms.rewardValue && (
            <div className={styles.item}>
              <h3 className={styles.title}>
                {terms.rewardType === 'funds'
                  ? t('bonusTermsModal.rewardAmount')
                  : terms.rewardType === 'percent'
                    ? t('bonusTermsModal.rewardPercent')
                    : t('bonusTermsModal.rewardType')}
              </h3>
              <p className={styles.value}>{terms.rewardValue}</p>
            </div>
          )}

          {terms.minDeposit && (
            <div className={styles.item}>
              <h3 className={styles.title}>{t('bonusTermsModal.minDeposit')}</h3>
              <p className={styles.value}>
                {terms.minDeposit} {getCurrencySymbol(terms.currency)}
              </p>
            </div>
          )}

          <div className={styles.item}>
            <h3 className={styles.title}>{t('bonusTermsModal.wager')}</h3>
            <p className={styles.value}>{terms.wager}</p>
          </div>

          <div className={styles.item}>
            <h3 className={styles.title}>{t('bonusTermsModal.wageringTime')}</h3>
            <p className={styles.value}>{terms.wageringTime}</p>
          </div>

          {terms.deadline && (
            <div className={styles.item}>
              <h3 className={styles.title}>{t('bonusTermsModal.deadline')}</h3>
              <p className={styles.value}>{terms.deadline}</p>
            </div>
          )}
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
