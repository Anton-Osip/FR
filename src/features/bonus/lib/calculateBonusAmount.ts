import { BonusChoiceResponse, BonusOverviewResponse, BonusUiChoice } from '../model/types';

const PERCENT_TO_DECIMAL = 100;

/**
 * Проверяет, активна ли депозитная кампания
 */
const isDepositCampaignActive = (depositCampaign: BonusOverviewResponse['deposit_campaign']): boolean => {
  return (
    depositCampaign.is_active &&
    !depositCampaign.is_closed &&
    depositCampaign.next_step_index != null &&
    depositCampaign.steps.length > 0
  );
};

/**
 * Рассчитывает сумму бонуса для депозитной кампании
 */
const calculateDepositCampaignBonus = (
  totalAmount: number,
  depositCampaign: BonusOverviewResponse['deposit_campaign'],
): number => {
  if (!isDepositCampaignActive(depositCampaign)) {
    return 0;
  }

  const nextStep = depositCampaign.steps.find(s => s.step_index === depositCampaign.next_step_index);

  if (!nextStep) {
    return 0;
  }

  const rewardType = nextStep.reward_type;

  // Для freespins не добавляем бонус к сумме депозита
  if (rewardType === 'freespins') {
    return 0;
  }

  if (rewardType === 'funds' && nextStep.amount) {
    // Фиксированная сумма бонуса
    return Number(nextStep.amount) || 0;
  }

  if (rewardType === 'percent') {
    const bonusPercent = Number(nextStep.reward_percent) || 0;

    return (totalAmount * bonusPercent) / PERCENT_TO_DECIMAL;
  }

  return totalAmount;
};

/**
 * Рассчитывает сумму бонуса для промодепа
 */
const calculatePromoDepositBonus = (
  totalAmount: number,
  promoDeposit: BonusOverviewResponse['promo_deposit'],
): number => {
  if (!promoDeposit.has_active_reserve) {
    return 0;
  }

  const rewardType = promoDeposit.reward_type;

  // Для freespins не добавляем бонус к сумме депозита
  if (rewardType === 'freespins') {
    return 0;
  }

  if (rewardType === 'percent' && promoDeposit.percent) {
    // Процентный бонус
    const bonusPercent = Number(promoDeposit.percent) || 0;

    return (totalAmount * bonusPercent) / PERCENT_TO_DECIMAL;
  }

  if (rewardType === 'funds' && promoDeposit.amount) {
    // Фиксированный бонус
    return Number(promoDeposit.amount) || 0;
  }

  return 0;
};

/**
 * Рассчитывает итоговую сумму депозита с учетом выбранного бонуса
 * @param baseAmount - Базовая сумма депозита (уже с учетом комиссии, если есть)
 * @param bonusChoice - Выбранный тип бонуса
 * @param bonusOverview - Обзор доступных бонусов
 * @returns Итоговая сумма с учетом бонуса
 */
export const calculateBonusAmount = (
  baseAmount: number,
  bonusChoice: BonusChoiceResponse | undefined,
  bonusOverview: BonusOverviewResponse | undefined,
): number => {
  if (!bonusChoice || bonusChoice.ui_choice === BonusUiChoice.None || !bonusOverview) {
    return baseAmount;
  }

  let totalAmount = baseAmount;

  if (bonusChoice.ui_choice === BonusUiChoice.DepositCampaign) {
    const bonusAmount = calculateDepositCampaignBonus(totalAmount, bonusOverview.deposit_campaign);

    totalAmount = totalAmount + bonusAmount;
  } else if (bonusChoice.ui_choice === BonusUiChoice.PromoDeposit) {
    const bonusAmount = calculatePromoDepositBonus(totalAmount, bonusOverview.promo_deposit);

    totalAmount = totalAmount + bonusAmount;
  }

  return totalAmount;
};
