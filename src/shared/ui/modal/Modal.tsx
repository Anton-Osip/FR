import React, { type FC, type ReactNode, useEffect, useRef, useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import { CrossIcon } from '@shared/ui/icons';
import { VisuallyHidden } from '@shared/ui/visuallyHidden';

import { Button } from '../button';

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
}

const CLOSE_TIMEOUT = 350;
const HEADER_AREA_OFFSET = 40;
const SCROLL_THRESHOLD = 5;
const HORIZONTAL_SWIPE_THRESHOLD = 0.5;
const SWIPE_THRESHOLD = 100;

export const Modal: FC<ModalProps> = ({
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
}: ModalProps) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [swipeY, setSwipeY] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [closedBySwipe, setClosedBySwipe] = useState<boolean>(false);
  const [finalSwipeY, setFinalSwipeY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartScrollTop = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOpenRef = useRef<boolean | undefined>(open ?? internalOpen);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const modalOpen = isControlled ? open : internalOpen;
  const modalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const resetSwipeState = (): void => {
    setSwipeY(0);
    setIsClosing(false);
    touchStartY.current = null;
    touchStartX.current = null;
    isSwiping.current = false;
    setClosedBySwipe(false);
    setFinalSwipeY(0);
  };

  useEffect(() => {
    if (!modalOpen && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [modalOpen]);

  // Сбрасываем состояние свайпа когда модальное окно закрывается
  useEffect(() => {
    if (!modalOpen && closedBySwipe) {
      const timeoutId = setTimeout(() => {
        resetSwipeState();
      }, CLOSE_TIMEOUT);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [modalOpen, closedBySwipe]);

  const handleOpenChange = (newOpen: boolean): void => {
    const wasOpen = prevOpenRef.current;

    // Если окно уже закрыто свайпом и мы пытаемся его закрыть, пропускаем обработку
    if (!newOpen && closedBySwipe && !wasOpen) {
      return;
    }

    prevOpenRef.current = newOpen;

    if (newOpen && !wasOpen) {
      resetSwipeState();
    } else if (!newOpen && !closedBySwipe) {
      resetSwipeState();
    }

    modalOnOpenChange(newOpen);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const element = contentRef.current;

    if (!element || !modalOpen) return;

    const handleNativeTouchMove = (e: TouchEvent): void => {
      if (isSwiping.current && touchStartY.current !== null) {
        const touch = e.touches[0];

        if (!touch) return;

        const currentY = touch.clientY;
        const deltaY = currentY - touchStartY.current;

        if (deltaY > 0) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    element.addEventListener('touchmove', handleNativeTouchMove, { passive: false, capture: true });

    return () => {
      element.removeEventListener('touchmove', handleNativeTouchMove, { capture: true });
    };
  }, [modalOpen]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    const target = (e.currentTarget as HTMLElement) || contentRef.current;

    if (!target) return;

    const touch = e.touches[0];
    const touchY = touch.clientY;
    const touchX = touch.clientX;
    const contentRect = target.getBoundingClientRect();
    const relativeY = touchY - contentRect.top;

    const SWIPE_AREA_HEIGHT = 120;
    const isAtTop = relativeY <= SWIPE_AREA_HEIGHT;

    const headerElement = headerRef.current || target.querySelector(`.${styles.header}`);
    let isInHeaderArea = false;

    if (headerElement) {
      const headerRect = (headerElement as HTMLElement).getBoundingClientRect();

      isInHeaderArea =
        touchY >= headerRect.top - HEADER_AREA_OFFSET && touchY <= headerRect.bottom + HEADER_AREA_OFFSET;
    }

    const canStartSwipe = isAtTop || isInHeaderArea;

    if (!canStartSwipe) {
      isSwiping.current = false;

      return;
    }

    const bodyElement = target.querySelector(`.${styles.body}`);
    let canScroll = true;

    if (bodyElement) {
      const bodyEl = bodyElement as HTMLElement;

      canScroll = bodyEl.scrollTop <= SCROLL_THRESHOLD;
    }

    if (canScroll) {
      canScroll = target.scrollTop <= SCROLL_THRESHOLD;
    }

    if (canScroll) {
      touchStartY.current = touchY;
      touchStartX.current = touchX;
      touchStartScrollTop.current = bodyElement ? (bodyElement as HTMLElement).scrollTop : target.scrollTop;
      isSwiping.current = true;
      if (!contentRef.current && target instanceof HTMLDivElement) {
        contentRef.current = target;
      }
    } else {
      isSwiping.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!isSwiping.current || touchStartY.current === null || touchStartX.current === null) {
      return;
    }

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const currentX = touch.clientX;
    const deltaY = currentY - touchStartY.current;
    const deltaX = Math.abs(currentX - touchStartX.current);

    if (deltaX > deltaY * HORIZONTAL_SWIPE_THRESHOLD) {
      isSwiping.current = false;
      setSwipeY(0);

      return;
    }

    if (deltaY > 0) {
      setSwipeY(deltaY);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>): void => {
    if (isClosing && e.propertyName === 'transform' && contentRef.current && closedBySwipe) {
      modalOnOpenChange(false);
    }
  };

  const handleTouchEnd = (): void => {
    if (!isSwiping.current) {
      return;
    }

    if (swipeY >= SWIPE_THRESHOLD && !isClosing) {
      setIsClosing(true);
      setClosedBySwipe(true);
      const viewportHeight = window.innerHeight;

      setFinalSwipeY(viewportHeight);

      requestAnimationFrame(() => {
        setSwipeY(viewportHeight);
      });
    } else {
      setSwipeY(0);
      setFinalSwipeY(0);
    }

    touchStartY.current = null;
    touchStartX.current = null;
    isSwiping.current = false;
  };

  return (
    <Dialog.Root open={modalOpen} onOpenChange={handleOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${overlayClassName || ''}`} />
        <Dialog.Content
          ref={contentRef}
          className={`${styles.content} ${contentClassName || ''} ${isClosing || closedBySwipe ? styles.swipeClosing : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform:
              closedBySwipe || swipeY > 0 ? `translateY(${closedBySwipe ? finalSwipeY : swipeY}px)` : undefined,
            transition: isClosing
              ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              : closedBySwipe
                ? 'none'
                : swipeY === 0
                  ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
            touchAction: 'pan-y',
          }}
        >
          {title ? (
            <div ref={headerRef} className={styles.header}>
              {typeof title === 'string' ? (
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              ) : (
                <Dialog.Title asChild>
                  <div>{title}</div>
                </Dialog.Title>
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
                className={`${styles.closeButton} ${closeButtonClassName ?? ''}`}
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
};

Modal.displayName = 'Modal';
