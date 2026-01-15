import type { LottieAnimationData } from './types';

/**
 * Заменяет второе изображение в JSON анимации Lottie на указанный URL изображения
 * @param animationData - JSON данные анимации Lottie
 * @param imageUrl - URL изображения для подстановки
 * @returns Копия анимации с замененным изображением
 */
export function replaceImageInAnimation(animationData: LottieAnimationData, imageUrl: string): LottieAnimationData {
  if (!imageUrl) {
    return animationData;
  }

  const animationCopy = JSON.parse(JSON.stringify(animationData)) as LottieAnimationData;

  if (animationCopy.assets && Array.isArray(animationCopy.assets)) {
    type AssetType = { p?: string; u?: string; w?: number; h?: number; id?: string };

    // Находим индексы всех изображений в массиве assets
    const imageIndices: number[] = [];

    animationCopy.assets.forEach((asset: AssetType, index: number) => {
      if (asset.p && typeof asset.p === 'string') {
        imageIndices.push(index);
      }
    });

    // Заменяем второе изображение (индекс 1 в массиве индексов)
    if (imageIndices.length > 1) {
      const secondImageIndex = imageIndices[1];
      const secondImageAsset = animationCopy.assets[secondImageIndex] as AssetType;

      if (secondImageAsset) {
        secondImageAsset.p = imageUrl;
        if (secondImageAsset.u !== undefined) {
          secondImageAsset.u = '';
        }
      }
    }
  }

  return animationCopy;
}
