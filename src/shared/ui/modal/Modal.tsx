import React, { forwardRef, ReactElement, type ReactNode, useImperativeHandle, useRef } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { Drawer } from 'vaul';

import { useMediaQuery } from '@shared/lib';
import { useSafeArea } from '@shared/lib/hooks/useSafeArea.tsx';
import { Button } from '@shared/ui/button';
import { CrossIcon } from '@shared/ui/icons';
import { VisuallyHidden } from '@shared/ui/visuallyHidden';

import styles from './Modal.module.scss';

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string | ReactNode;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
  showCloseButton?: boolean;
  contentClassName?: string;
  overlayClassName?: string;
  closeButtonClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  portalContainer?: Element | DocumentFragment | null;
  withoutOverlay?: boolean;
  snapPoints?: (number | string)[];
  fadeFromIndex?: number;
  modal?: boolean;
  dismissible?: boolean;
  onDrag?: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  onRelease?: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
}

const DESKTOP_QUERY = '(min-width: 1024px)';

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      trigger,
      showCloseButton = true,
      contentClassName,
      bodyClassName,
      overlayClassName,
      closeButtonClassName,
      headerClassName,
      portalContainer,
      withoutOverlay = false,
      snapPoints,
      fadeFromIndex,
      modal = true,
      dismissible = true,
      onDrag,
      onRelease,
    }: ModalProps,
    ref,
  ) => {
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const { isIOS, isMobile, isAndroid } = useSafeArea();

    useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // Десктопная версия с Radix Dialog
    if (isDesktop) {
      return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
          {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
          <Dialog.Portal container={portalContainer}>
            {!withoutOverlay && <Dialog.Overlay className={clsx(styles.overlay, overlayClassName)} />}
            <Dialog.Content ref={contentRef} className={clsx(styles.content, contentClassName)}>
              {title ? (
                <div className={clsx(styles.header, headerClassName)}>
                  {typeof title === 'string' ? (
                    <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                  ) : (
                    <Dialog.Title asChild>{title}</Dialog.Title>
                  )}
                </div>
              ) : (
                <VisuallyHidden>
                  <Dialog.Title>Диалог</Dialog.Title>
                </VisuallyHidden>
              )}
              {showCloseButton && (
                <Dialog.Close asChild>
                  <Button
                    variant="secondary"
                    className={clsx(styles.closeButton, closeButtonClassName)}
                    size={'s'}
                    aria-label="Закрыть"
                  >
                    <CrossIcon />
                  </Button>
                </Dialog.Close>
              )}
              <Dialog.Description className={styles.description} hidden={!description}>
                {description || ''}
              </Dialog.Description>
              <div className={clsx(styles.body, bodyClassName)}>{children}</div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      );
    }

    // Базовые пропсы для Drawer.Root
    const baseDrawerProps = {
      open,
      onOpenChange,
      modal,
      dismissible,
      shouldScaleBackground: true,
      repositionInputs: false, // Отключаем автоматическое репозиционирование при открытии клавиатуры
      ...(onDrag && { onDrag }),
      ...(onRelease && { onRelease }),
    };

    // Функция для рендера содержимого Drawer (одинаковое для всех случаев)
    const renderDrawerContent = (): ReactElement => (
      <Drawer.Content
        ref={contentRef}
        className={clsx(
          styles.drawerContent,
          isMobile && styles.mobile,
          isAndroid && styles.android,
          isIOS && styles.isIOS,
          contentClassName,
        )}
      >
        {title ? (
          <div className={clsx(styles.drawerHeader, headerClassName)}>
            {typeof title === 'string' ? (
              <Drawer.Title className={styles.title}>{title}</Drawer.Title>
            ) : (
              <Drawer.Title asChild>{title}</Drawer.Title>
            )}
          </div>
        ) : (
          <VisuallyHidden>
            <Drawer.Title>Диалог</Drawer.Title>
          </VisuallyHidden>
        )}

        {showCloseButton && (
          <Drawer.Close asChild>
            <Button
              variant="secondary"
              className={clsx(styles.drawerCloseButton, closeButtonClassName)}
              size={'s'}
              aria-label="Закрыть"
            >
              <CrossIcon />
            </Button>
          </Drawer.Close>
        )}

        <Drawer.Description className={styles.description} hidden={!description}>
          {description || ''}
        </Drawer.Description>

        <div className={clsx(styles.drawerBody, bodyClassName)}>{children}</div>
      </Drawer.Content>
    );

    // Если есть и snapPoints и fadeFromIndex
    if (snapPoints && fadeFromIndex !== undefined) {
      return (
        <Drawer.Root {...baseDrawerProps} snapPoints={snapPoints} fadeFromIndex={fadeFromIndex}>
          {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
          <Drawer.Portal container={portalContainer}>
            {!withoutOverlay && <Drawer.Overlay className={clsx(styles.overlay, overlayClassName)} />}
            {renderDrawerContent()}
          </Drawer.Portal>
        </Drawer.Root>
      );
    }

    // Только snapPoints
    if (snapPoints) {
      return (
        <Drawer.Root {...baseDrawerProps} snapPoints={snapPoints}>
          {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
          <Drawer.Portal container={portalContainer}>
            {!withoutOverlay && <Drawer.Overlay className={clsx(styles.overlay, overlayClassName)} />}
            {renderDrawerContent()}
          </Drawer.Portal>
        </Drawer.Root>
      );
    }

    // Без snapPoints (fadeFromIndex игнорируется, так как требует snapPoints)
    return (
      <Drawer.Root {...baseDrawerProps}>
        {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
        <Drawer.Portal container={portalContainer}>
          {!withoutOverlay && <Drawer.Overlay className={clsx(styles.overlay, overlayClassName)} />}
          {renderDrawerContent()}
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
);

Modal.displayName = 'Modal';
