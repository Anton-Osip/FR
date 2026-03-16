import React from 'react';

import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * Современный Toast API на базе Sonner
 * Совместим с предыдущим API для плавной миграции
 */

export interface ToastOptions extends ExternalToast {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
}

/**
 * Основная функция для показа toast
 */
function createToast(title: string, options?: ToastOptions): string | number {
  const { variant = 'default', description, ...restOptions } = options || {};

  const toastOptions: ExternalToast = {
    ...restOptions,
    description,
  };

  switch (variant) {
    case 'success':
      return sonnerToast.success(title, toastOptions);
    case 'error':
      return sonnerToast.error(title, toastOptions);
    case 'warning':
      return sonnerToast.warning(title, toastOptions);
    case 'info':
      return sonnerToast.info(title, toastOptions);
    case 'loading':
      return sonnerToast.loading(title, toastOptions);
    default:
      return sonnerToast(title, toastOptions);
  }
}

/**
 * Toast API в стиле функций
 */
export const toast = Object.assign(createToast, {
  success: (title: string, description?: string, duration?: number): string | number => {
    return sonnerToast.success(title, { description, duration });
  },

  error: (title: string, description?: string, duration?: number): string | number => {
    return sonnerToast.error(title, { description, duration });
  },

  warning: (title: string, description?: string, duration?: number): string | number => {
    return sonnerToast.warning(title, { description, duration });
  },

  info: (title: string, description?: string, duration?: number): string | number => {
    return sonnerToast.info(title, { description, duration });
  },

  loading: (title: string, description?: string): string | number => {
    return sonnerToast.loading(title, { description });
  },

  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
      description?: string;
      duration?: number;
    },
  ): ReturnType<typeof sonnerToast.promise> => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
      duration: options.duration,
    });
  },

  custom: (jsx: (id: string | number) => React.ReactElement, options?: ExternalToast) => {
    return sonnerToast.custom(jsx, options);
  },

  message: (title: string, options?: ExternalToast): string | number => {
    return sonnerToast(title, options);
  },

  dismiss: (id?: string | number): void => {
    sonnerToast.dismiss(id);
  },
});

// Экспортируем оригинальные типы из sonner для продвинутого использования
export type { ExternalToast, ToastT } from 'sonner';
