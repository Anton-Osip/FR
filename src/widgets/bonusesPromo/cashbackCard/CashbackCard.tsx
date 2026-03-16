import { type FC, useMemo, useState, useEffect, ReactElement } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { formatAmount, getCurrencySymbol } from '@shared/lib';
import { formatSecondsToTime } from '@shared/lib/dateFormatter';
import { Button, Tab, Tabs } from '@shared/ui';
import { ClockIcon, FireOutlineIcon, LockIcon, InfoIcon } from '@shared/ui/icons';

const INTERVAL_UPDATE_MS = 1000;
const POLLING_INTERVAL_MS = 30000;

import { CashbackModal } from '@widgets/bonusesModal/cashbackModal';

import closeBoxMonthly from '../../../shared/assets/icons/bonuses/closeBoxMonthly.svg?url';
import closeBoxWeekly from '../../../shared/assets/icons/bonuses/closeBoxWeekly.svg?url';
import openBoxMonthly from '../../../shared/assets/icons/bonuses/openBoxMonthly.svg?url';
import openBoxWeekly from '../../../shared/assets/icons/bonuses/openBoxWeekly.svg?url';

import styles from './CashbackCard.module.scss';

import { useGetCashbackQuery, useClaimCashbackMutation } from '@/features/bonus/api/bonusApi';

interface CashbackCardProps {
  className?: string;
}

export const CashbackCard: FC<CashbackCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [cashbackModalIsOpe, setCashbackModalIsOpe] = useState<boolean>(false);
  const [claimExpiresTimer, setClaimExpiresTimer] = useState<number>(0);
  const [nextPayoutTimer, setNextPayoutTimer] = useState<number>(0);

  const { data: cashbackData } = useGetCashbackQuery(undefined, {
    pollingInterval: POLLING_INTERVAL_MS,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [claimCashback, { isLoading: isClaimingCashback }] = useClaimCashbackMutation();

  const currentCashbackInfo = useMemo(() => {
    if (!cashbackData) return null;

    return activeTab === 'weekly' ? cashbackData.weekly : cashbackData.monthly;
  }, [cashbackData, activeTab]);

  useEffect(() => {
    if (currentCashbackInfo?.claimable?.claim_expires_in) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClaimExpiresTimer(currentCashbackInfo.claimable.claim_expires_in);
    }
    if (currentCashbackInfo?.next_payout_in) {
      setNextPayoutTimer(currentCashbackInfo.next_payout_in);
    }
  }, [currentCashbackInfo]);

  // Таймер обратного отсчета
  useEffect(() => {
    const interval = setInterval(() => {
      setClaimExpiresTimer(prev => Math.max(0, prev - 1));
      setNextPayoutTimer(prev => Math.max(0, prev - 1));
    }, INTERVAL_UPDATE_MS);

    return () => clearInterval(interval);
  }, []);

  const requiredRankText = useMemo(() => {
    if (!currentCashbackInfo?.required_rank) return t('cashbackCard.fromRankBronze');

    const rank = currentCashbackInfo.required_rank.toLowerCase();

    return t('cashbackCard.fromRank', { rank: t(`benefitsSection.ranks.${rank}`) });
  }, [currentCashbackInfo, t]);

  const handleClaimCashback = async (): Promise<void> => {
    try {
      await claimCashback({ cashback_type: activeTab }).unwrap();
      // RTK Query автоматически обновит данные благодаря invalidatesTags
    } catch (error) {
      console.error('Ошибка при получении кэшбека:', error);
    }
  };

  // Определяем текущее состояние
  const { isNotAvailableByRank, hasClaimable, isPendingApproval } = useMemo(
    () => ({
      isNotAvailableByRank: !currentCashbackInfo?.is_available,
      hasClaimable: !!currentCashbackInfo?.claimable,
      isPendingApproval: currentCashbackInfo?.status?.status === 'pending_approval',
    }),
    [currentCashbackInfo],
  );

  const TabsItems: Tab[] = useMemo(
    () => [
      { id: '1', label: t('cashbackCard.weekly'), value: 'weekly', active: activeTab === 'weekly' },
      { id: '2', label: t('cashbackCard.monthly'), value: 'monthly', active: activeTab === 'monthly' },
    ],
    [activeTab, t],
  );

  // Рендер кнопок в зависимости от состояния
  const renderButtons = (): ReactElement => {
    // Состояние 1: Claimable - есть что забрать
    if (hasClaimable && currentCashbackInfo?.claimable) {
      const { amount, currency } = currentCashbackInfo.claimable;
      const formattedAmount = `${formatAmount(Number(amount))} ${getCurrencySymbol(currency)}`;

      return (
        <Button
          size={'m'}
          variant={'primary'}
          className={styles.claimButton}
          onClick={handleClaimCashback}
          disabled={isClaimingCashback}
          icon={<ClockIcon />}
        >
          {t('cashbackCard.claimWithAmount', { amount: formattedAmount })}
          {formatSecondsToTime(claimExpiresTimer)}
        </Button>
      );
    }

    // Состояние 2: Pending Approval - рассчитываем
    if (isPendingApproval && currentCashbackInfo?.status) {
      return (
        <Button size={'m'} variant={'tertiary'} className={styles.pendingButton} disabled={true}>
          {t('cashbackCard.calculating')}
        </Button>
      );
    }

    // Состояние 3: Next Payout - следующая выплата
    if (!isNotAvailableByRank && currentCashbackInfo) {
      return (
        <Button icon={<ClockIcon />} size={'m'} variant={'tertiary'} className={styles.clockButton}>
          {formatSecondsToTime(nextPayoutTimer)}
        </Button>
      );
    }

    // Состояние 4: Недоступно по рангу
    return (
      <Button icon={<LockIcon />} size={'m'} variant={'tertiary'} className={styles.blockedButton} disabled={true}>
        {requiredRankText}
      </Button>
    );
  };

  return (
    <div className={clsx(styles.cashbackCard, className)}>
      <div className={styles.info}>
        <Tabs
          items={TabsItems}
          onChange={value => setActiveTab(value as 'weekly' | 'monthly')}
          className={styles.tabs}
        />
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('cashbackCard.title')}</h3>
          <p className={styles.description}>{t('cashbackCard.description')}</p>
        </div>
        <div className={styles.button}>{renderButtons()}</div>
      </div>
      {isNotAvailableByRank ? (
        <div className={styles.imageWrapper}>
          <Button variant={'ghost'} className={styles.topNotification} onClick={() => setCashbackModalIsOpe(true)}>
            <InfoIcon />
          </Button>
          <img src={activeTab === 'weekly' ? closeBoxWeekly : closeBoxMonthly} alt="closeBoxe" />
        </div>
      ) : (
        <div className={styles.imageWrapperOpen}>
          <Button variant={'ghost'} className={styles.topNotification} onClick={() => setCashbackModalIsOpe(true)}>
            <InfoIcon />
          </Button>
          <img src={activeTab === 'weekly' ? openBoxWeekly : openBoxMonthly} alt="closeBoxeWeekly" />
          {hasClaimable && (
            <div className={styles.bottomNotification}>
              <FireOutlineIcon />
              {t('cashbackCard.expiresIn', { time: formatSecondsToTime(claimExpiresTimer) })}
            </div>
          )}
        </div>
      )}
      <CashbackModal
        cashbackData={cashbackData}
        cashbackPeriod={activeTab}
        open={cashbackModalIsOpe}
        onOpenChange={setCashbackModalIsOpe}
      />
    </div>
  );
};
