import { getCurrencySymbol } from '@shared/lib/formatting';

import { BonusOverviewResponse } from '../model/types';

/**
 * Рассчитывает rightLabel для промодепа на основе типа награды
 * @param promoDeposit - Данные промодепа
 * @returns Строка с информацией о бонусе (например, "+10%" или "100 ₽") или null
 */
export const getPromoDepositRightLabel = (promoDeposit: BonusOverviewResponse['promo_deposit']): string | null => {
  if (!promoDeposit.has_active_reserve) {
    return null;
  }

  const rewardType = promoDeposit.reward_type;

  if (rewardType === 'percent' && promoDeposit.percent) {
    return `+${promoDeposit.percent}%`;
  }

  if (rewardType === 'funds' && promoDeposit.amount) {
    const currencySymbol = getCurrencySymbol(promoDeposit.currency);

    return `${promoDeposit.amount} ${currencySymbol}`.trim();
  }

  if (rewardType === 'freespins' && promoDeposit.fs_quantity) {
    return `${promoDeposit.fs_quantity} FS`;
  }

  return null;
};
