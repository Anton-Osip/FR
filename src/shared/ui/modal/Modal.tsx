import React, { forwardRef, type ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

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
  swipeCloseElementRef?: React.RefObject<HTMLElement | null>;
}

const CLOSE_TIMEOUT = 350;
const ANIMATION_DURATION_MS = 350;
const HEADER_AREA_OFFSET = 40;
const HORIZONTAL_SWIPE_THRESHOLD = 0.5;
const MIN_SWIPE_DISTANCE = 50;
const SWIPE_DISTANCE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const SWIPE_MIN_COMPLETE_DURATION_MS = 120;
const SWIPE_MAX_COMPLETE_DURATION_MS = ANIMATION_DURATION_MS;
const SWIPE_VELOCITY_FACTOR_MIN = 0.1;
const SWIPE_VELOCITY_FACTOR_MAX = 1.5;
const DESKTOP_MIN_WIDTH = 1024;

const calculateSwipeCompleteDuration = (remainingDistance: number, swipeVelocity: number): number => {
  if (remainingDistance <= 0) {
    return ANIMATION_DURATION_MS;
  }

  const velocityFactor = Math.min(Math.max(swipeVelocity, SWIPE_VELOCITY_FACTOR_MIN), SWIPE_VELOCITY_FACTOR_MAX);
  const distanceRatio = Math.min(
    Math.max(remainingDistance / (typeof window !== 'undefined' ? window.innerHeight : 1), 0),
    1,
  );

  const rawDuration = ANIMATION_DURATION_MS * distanceRatio * (1 / velocityFactor);

  return Math.min(SWIPE_MAX_COMPLETE_DURATION_MS, Math.max(SWIPE_MIN_COMPLETE_DURATION_MS, rawDuration));
};

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
      swipeCloseElementRef,
    }: ModalProps,
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState<boolean>(false);
    const [swipeY, setSwipeY] = useState<number>(0);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [closedBySwipe, setClosedBySwipe] = useState<boolean>(false);
    const [finalSwipeY, setFinalSwipeY] = useState<number>(0);
    const [closeDuration, setCloseDuration] = useState<number>(ANIMATION_DURATION_MS);
    const touchStartY = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartTime = useRef<number | null>(null);
    const isSwiping = useRef<boolean>(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevOpenRef = useRef<boolean | undefined>(open ?? internalOpen);

    useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const modalOpen = isControlled ? open : internalOpen;
    const modalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    const resetSwipeState = (): void => {
      setSwipeY(0);
      setIsClosing(false);
      touchStartY.current = null;
      touchStartX.current = null;
      touchStartTime.current = null;
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

      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN_WIDTH) {
        return;
      }

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
      e.stopPropagation();
      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN_WIDTH) {
        return;
      }

      const target = (e.currentTarget as HTMLElement) || contentRef.current;

      if (!target) return;

      const touch = e.touches[0];
      const touchY = touch.clientY;
      const touchX = touch.clientX;

      const swipeElement =
        (swipeCloseElementRef && swipeCloseElementRef.current) ||
        headerRef.current ||
        target.querySelector(`.${styles.header}`);

      if (!swipeElement) {
        // если нет элемента для свайпа, свайп-закрытие недоступно
        isSwiping.current = false;

        return;
      }

      const swipeRect = (swipeElement as HTMLElement).getBoundingClientRect();
      const isInHeaderArea =
        touchY >= swipeRect.top - HEADER_AREA_OFFSET && touchY <= swipeRect.bottom + HEADER_AREA_OFFSET;

      // Разрешаем свайп только если жест начался в области заданного элемента
      if (!isInHeaderArea) {
        isSwiping.current = false;

        return;
      }

      touchStartY.current = touchY;
      touchStartX.current = touchX;
      touchStartTime.current = Date.now();
      isSwiping.current = true;
      if (!contentRef.current && target instanceof HTMLDivElement) {
        contentRef.current = target;
      }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
      e.stopPropagation();
      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN_WIDTH) {
        return;
      }

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

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
      e.stopPropagation();
      if (typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN_WIDTH) {
        return;
      }

      if (!isSwiping.current || touchStartTime.current === null || touchStartY.current === null) {
        return;
      }

      const deltaTime = Date.now() - touchStartTime.current;
      const swipeVelocity = swipeY / Math.max(deltaTime, 1);

      const shouldCloseByDistance = swipeY > SWIPE_DISTANCE_THRESHOLD;
      const shouldCloseByVelocity = swipeY > MIN_SWIPE_DISTANCE && swipeVelocity > SWIPE_VELOCITY_THRESHOLD;

      if ((shouldCloseByDistance || shouldCloseByVelocity) && !isClosing) {
        setIsClosing(true);
        setClosedBySwipe(true);
        const viewportHeight = window.innerHeight;
        const remainingDistance = Math.max(viewportHeight - swipeY, 0);
        const duration = calculateSwipeCompleteDuration(remainingDistance, swipeVelocity);

        setCloseDuration(duration);
        setFinalSwipeY(viewportHeight);

        requestAnimationFrame(() => {
          setSwipeY(viewportHeight);
        });
      } else {
        setSwipeY(0);
        setFinalSwipeY(0);
        setCloseDuration(ANIMATION_DURATION_MS);
      }

      touchStartY.current = null;
      touchStartX.current = null;
      touchStartTime.current = null;
      isSwiping.current = false;
    };

    return (
      <Dialog.Root open={modalOpen} onOpenChange={handleOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal container={portalContainer}>
          {!withoutOverlay && <Dialog.Overlay className={clsx(styles.overlay, overlayClassName)} />}

          <Dialog.Content
            ref={contentRef}
            className={clsx(styles.content, contentClassName, isClosing || closedBySwipe ? styles.swipeClosing : '')}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform:
                closedBySwipe || swipeY > 0 ? `translateY(${closedBySwipe ? finalSwipeY : swipeY}px)` : undefined,
              transition: isClosing
                ? `transform ${closeDuration}ms ease-out`
                : closedBySwipe
                  ? 'none'
                  : swipeY === 0
                    ? `transform ${ANIMATION_DURATION_MS}ms ease-out`
                    : 'none',
              touchAction: 'pan-y',
            }}
          >
            {title ? (
              <div ref={headerRef} className={clsx(styles.header, headerClassName)}>
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
  },
);

Modal.displayName = 'Modal';
