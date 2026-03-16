import { type RankType } from '@entities/user';

export const RANK_ORDER: RankType[] = ['bronze', 'silver', 'gold', 'diamond'];

/**
 * Нормализует ранг к типу RankType
 * @param rank - Ранг для нормализации
 * @returns Нормализованный ранг или null
 */
const normalizeRank = (rank: string | null | undefined): RankType | null => {
  if (!rank) return null;
  const normalized = rank.toLowerCase() as RankType;

  return RANK_ORDER.includes(normalized) ? normalized : null;
};

/**
 * Проверяет, соответствует ли ранг пользователя требуемому рангу или выше
 * @param userRank - Ранг пользователя
 * @param requiredRank - Требуемый ранг
 * @returns true, если ранг пользователя достаточен
 */
export const isRankSufficient = (
  userRank: RankType | string | null | undefined,
  requiredRank: RankType | string | null | undefined,
): boolean => {
  const normalizedUserRank = normalizeRank(userRank);
  const normalizedRequiredRank = normalizeRank(requiredRank);

  // Если ранг пользователя не определен, он не соответствует требуемому рангу
  if (!normalizedUserRank) return false;

  // Если требуемый ранг не указан, считаем что ранг достаточен
  if (!normalizedRequiredRank) return true;

  const userRankIndex = RANK_ORDER.indexOf(normalizedUserRank);
  const requiredRankIndex = RANK_ORDER.indexOf(normalizedRequiredRank);

  return userRankIndex >= requiredRankIndex;
};
