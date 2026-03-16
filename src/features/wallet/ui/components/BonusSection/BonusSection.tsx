import { FC, useCallback, useMemo, useRef, useState, useEffect, ReactNode } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { ToggleSwitch } from '@shared/ui';
import { InfoIcon } from '@shared/ui/icons';

import { BonusGlow } from '../../Deposit/BankPaymentContent/BonusGlow';

import styles from './BonusSection.module.scss';
import { PromoDepositTermsModal } from './PromoDepositTermsModal';

import { useGetBonusOverviewQuery, useGetBonusChoiceQuery, usePutBonusChoiceMutation } from '@features/bonus';
import { getPromoDepositRightLabel } from '@features/bonus/lib';
import { BonusUiChoice } from '@features/bonus/model';
import { BonusTermsModal } from '@features/wallet/ui/components/BonusSection/BonusTermsModal';

interface Props {
  disabled?: boolean;
}

interface BonusRowProps {
  title: string;
  description: ReactNode;
  isActive: boolean;
  onToggle: (isOn: boolean) => void;
  disabled: boolean;
  isUpdating: boolean;
}

const BonusRow: FC<BonusRowProps> = ({ title, description, isActive, onToggle, disabled, isUpdating }) => {
  return (
    <div className={styles.bonusRow}>
      <div className={clsx(styles.bonusTrigger, styles.bonusContainer)}>
        <div className={styles.left}>
          <h4 className={styles.title}>{title}</h4>
          <div className={styles.description}>{description}</div>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <ToggleSwitch onToggle={onToggle} isOn={isActive} disabled={isUpdating || disabled} />
        </div>
      </div>
    </div>
  );
};

export const BonusSection: FC<Props> = ({ disabled }) => {
  const { t } = useTranslation('walletModal');

  const { data: overview } = useGetBonusOverviewQuery();
  const { data: choice } = useGetBonusChoiceQuery();
  const [putBonusChoice, { isLoading: isUpdatingBonusChoice }] = usePutBonusChoiceMutation();

  // Отслеживаем последний запрошенный выбор для предотвращения прыжков
  const pendingChoiceRef = useRef<BonusUiChoice | null>(null);
  const [localActiveChoice, setLocalActiveChoice] = useState<BonusUiChoice>(BonusUiChoice.None);

  // Синхронизируем локальное состояние с данными с сервера, только если нет ожидающих запросов
  useEffect(() => {
    if (!choice) return;

    const serverChoice = choice.ui_choice;

    if (pendingChoiceRef.current === null || pendingChoiceRef.current === serverChoice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalActiveChoice(serverChoice);
      if (pendingChoiceRef.current === serverChoice) {
        pendingChoiceRef.current = null;
      }
    }
  }, [choice]);

  const { depositCampaignData, promoDepositData } = useMemo(() => {
    if (!overview || !choice) {
      return { depositCampaignData: null, promoDepositData: null };
    }

    const depositCampaign = overview.deposit_campaign;
    const hasDepositCampaignLiveSteps =
      depositCampaign.is_active &&
      !depositCampaign.is_closed &&
      depositCampaign.next_step_index != null &&
      depositCampaign.steps.length > 0;

    const nextStep = hasDepositCampaignLiveSteps
      ? (depositCampaign.steps.find(s => s.step_index === depositCampaign.next_step_index) ?? null)
      : null;
    const rewardPercent = nextStep ? Number(nextStep.reward_percent) : 0;

    const hasPromoDepositReserve =
      overview.summary.has_promo_deposit_reserve ||
      overview.promo_deposit.has_active_reserve ||
      choice.has_active_promo_deposit_reserve;

    // Вычисляем rightLabel для промодепа на основе reward_type
    const promoDepositRightLabel = hasPromoDepositReserve ? getPromoDepositRightLabel(overview.promo_deposit) : null;

    return {
      depositCampaignData: hasDepositCampaignLiveSteps
        ? {
            available: true,
            rewardPercent,
            nextStep,
          }
        : null,
      promoDepositData: hasPromoDepositReserve
        ? {
            available: true,
            promoDeposit: overview.promo_deposit,
            rightLabel: promoDepositRightLabel,
          }
        : null,
    };
  }, [overview, choice]);

  const handleToggle = useCallback(
    (bonusType: 'deposit_campaign' | 'promo_deposit', isOn: boolean) => {
      if (!choice || isUpdatingBonusChoice) return;

      const newChoice: BonusUiChoice = isOn
        ? bonusType === 'deposit_campaign'
          ? BonusUiChoice.DepositCampaign
          : BonusUiChoice.PromoDeposit
        : BonusUiChoice.None;

      // Проверяем против локального состояния, чтобы учитывать только последний клик
      const currentExpectedChoice = pendingChoiceRef.current ?? choice.ui_choice;

      if (newChoice === currentExpectedChoice) return;

      // Обновляем локальное состояние сразу для мгновенной реакции UI
      setLocalActiveChoice(newChoice);
      // Сохраняем ожидаемое значение (перезаписываем предыдущее, если оно было)
      pendingChoiceRef.current = newChoice;
      // Отправляем запрос
      putBonusChoice({ choice: newChoice })
        .unwrap()
        .then(() => {
          // При успехе очищаем ожидаемое значение только если оно совпадает с текущим
          if (pendingChoiceRef.current === newChoice) {
            pendingChoiceRef.current = null;
          }
        })
        .catch(() => {
          // При ошибке откатываем локальное состояние
          setLocalActiveChoice(choice.ui_choice);
          // Очищаем ожидаемое значение только если это был последний запрос
          if (pendingChoiceRef.current === newChoice) {
            pendingChoiceRef.current = null;
          }
        });
    },
    [choice, putBonusChoice, isUpdatingBonusChoice],
  );

  const depositCampaignActive = localActiveChoice === BonusUiChoice.DepositCampaign;
  const promoDepositActive = localActiveChoice === BonusUiChoice.PromoDeposit;
  const isCollapsibleOpen = (depositCampaignActive || promoDepositActive) && !disabled;

  // Определяем данные для отображения в bonusContent
  const bonusContentData = useMemo(() => {
    if (depositCampaignActive && depositCampaignData?.available) {
      return {
        title: t('bonus.percentDeposit', { percent: depositCampaignData.rewardPercent }),
        bonusLabel: t('bonus.label'),
        rightLabel: `+${depositCampaignData.rewardPercent}%`,
      };
    }
    if (promoDepositActive && promoDepositData?.available) {
      return {
        title: t('bonus.promoCodeReward'),
        bonusLabel: t('bonus.label'),
        rightLabel: promoDepositData.rightLabel,
      };
    }

    return null;
  }, [depositCampaignActive, promoDepositActive, depositCampaignData, promoDepositData, t]);

  if (!overview || !choice) {
    return null;
  }

  const hasAnyBonus = depositCampaignData?.available || promoDepositData?.available;

  if (!hasAnyBonus) {
    return null;
  }

  return (
    <div className={styles.bonusWrapper}>
      <div className={styles.bg}>
        <BonusGlow />
      </div>

      <Collapsible.Root open={isCollapsibleOpen}>
        <Collapsible.Content className={styles.bonusContent}>
          <div className={styles.bonusContainer}>
            <div className={styles.left}>
              <h4 className={styles.title}>{bonusContentData?.title}</h4>
              <p className={styles.descriptionLabel}>{bonusContentData?.bonusLabel}</p>
            </div>
            {bonusContentData?.rightLabel && <div className={styles.right}>{bonusContentData?.rightLabel}</div>}
          </div>
        </Collapsible.Content>
        {depositCampaignData?.available && (
          <BonusRow
            title={t('bonus.percentDeposit', { percent: depositCampaignData.rewardPercent })}
            description={
              <BonusTermsModal
                step={depositCampaignData.nextStep}
                trigger={
                  <p className={styles.descriptionText}>
                    <InfoIcon />
                    {t('bonus.terms')}
                  </p>
                }
              />
            }
            isActive={depositCampaignActive}
            onToggle={isOn => {
              handleToggle('deposit_campaign', isOn);
            }}
            disabled={disabled ?? false}
            isUpdating={isUpdatingBonusChoice}
          />
        )}

        {promoDepositData?.available && (
          <BonusRow
            title={t('bonus.promoCodeReward')}
            description={
              <PromoDepositTermsModal
                promoDeposit={promoDepositData.promoDeposit}
                trigger={
                  <p className={styles.descriptionText}>
                    <InfoIcon />
                    {t('bonus.terms')}
                  </p>
                }
              />
            }
            isActive={promoDepositActive}
            onToggle={isOn => {
              handleToggle('promo_deposit', isOn);
            }}
            disabled={disabled ?? false}
            isUpdating={isUpdatingBonusChoice}
          />
        )}
      </Collapsible.Root>
    </div>
  );
};
