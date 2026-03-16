import { toast } from '@shared/ui/toast';

/**
 * Копирует текст в буфер обмена и показывает уведомление
 * @param value - Текст для копирования
 * @param successTitle - Заголовок успешного уведомления
 * @param successDescription - Описание успешного уведомления (опционально)
 * @param errorTitle - Заголовок ошибки (по умолчанию: 'Не удалось скопировать')
 * @param errorDescription - Описание ошибки (по умолчанию: 'Попробуйте еще раз')
 * @returns Promise<void>
 */
export const copyToClipboard = async (
  value: string,
  successTitle: string,
  successDescription?: string,
  errorTitle: string = 'Не удалось скопировать',
  errorDescription: string = 'Попробуйте еще раз',
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value);
    toast.info(successTitle, successDescription);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error(errorTitle, errorDescription);
  }
};
