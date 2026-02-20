import { SyntheticEvent } from 'react';

import anonAvatar from '@shared/assets/images/anon_avatar.webp';

/**
 * Обрабатывает ошибку загрузки изображения, заменяя его на дефолтный аватар
 * @param event - событие ошибки загрузки изображения
 */
export const handleImageError = (event: SyntheticEvent<HTMLImageElement>): void => {
  const img = event.currentTarget;

  img.onerror = null;
  img.src = anonAvatar;
};
