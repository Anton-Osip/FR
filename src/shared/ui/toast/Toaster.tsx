import { type CSSProperties, type ReactElement } from 'react';

import { Toaster as SonnerToaster } from 'sonner';

import styles from './Toaster.module.scss';

const DEFAULT_DURATION = 4000;
const DEFAULT_VISIBLE_TOASTS = 3;
const TOAST_GAP = 12;
const TOAST_Z_INDEX = 10001;

export interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
}

interface ToastStyleVars extends CSSProperties {
  '--toast-duration'?: string;
}

export const Toaster = ({
  position = 'top-right',
  theme = 'dark',
  richColors = false,
  expand = false,
  duration = DEFAULT_DURATION,
  visibleToasts = DEFAULT_VISIBLE_TOASTS,
  closeButton = false,
}: ToasterProps): ReactElement => {
  const toastDuration = Number.isFinite(duration) ? `${duration}ms` : '0ms';

  const toastStyle: ToastStyleVars = {
    '--toast-duration': toastDuration,
  };

  return (
    <SonnerToaster
      position={position}
      theme={theme}
      richColors={richColors}
      expand={expand}
      duration={duration}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      gap={TOAST_GAP}
      style={{
        zIndex: TOAST_Z_INDEX,
      }}
      toastOptions={{
        style: toastStyle,
        classNames: {
          toast: styles.toast,
          title: styles.title,
          description: styles.description,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
          closeButton: styles.closeButton,
          success: styles.success,
          error: styles.error,
          warning: styles.warning,
          info: styles.info,
          loading: styles.loading,
        },
      }}
    />
  );
};
