import { type FC, type ReactNode, useState } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import clsx from 'clsx';

import styles from './Tooltip.module.scss';

const DEFAULT_DELAY_DURATION = 700;
const DEFAULT_SKIP_DELAY_DURATION = 300;
const DEFAULT_SIDE_OFFSET = 8;
const DEFAULT_ARROW_WIDTH = 8;
const DEFAULT_ARROW_HEIGHT = 4;
const DEFAULT_ALIGN_OFFSET = 0;
const MOBILE_DELAY_DURATION = 0;

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
  );
};

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

export const TooltipProvider: FC<TooltipProviderProps> = ({
  children,
  delayDuration = DEFAULT_DELAY_DURATION,
  skipDelayDuration = DEFAULT_SKIP_DELAY_DURATION,
  disableHoverableContent = false,
}) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
};

TooltipProvider.displayName = 'TooltipProvider';

export interface TooltipRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

export const TooltipRoot: FC<TooltipRootProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
}) => {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {children}
    </TooltipPrimitive.Root>
  );
};

TooltipRoot.displayName = 'TooltipRoot';

export interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
}

export const TooltipTrigger: FC<TooltipTriggerProps> = ({ children, asChild = false, className, onClick }) => {
  return (
    <TooltipPrimitive.Trigger asChild={asChild} className={clsx(styles.trigger, className)} onClick={onClick}>
      {children}
    </TooltipPrimitive.Trigger>
  );
};

TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps {
  children: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | null | Array<Element | null>;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  forceMount?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
}

export const TooltipContent: FC<TooltipContentProps> = ({
  children,
  className,
  side = 'top',
  sideOffset = DEFAULT_SIDE_OFFSET,
  align = 'center',
  alignOffset = DEFAULT_ALIGN_OFFSET,
  avoidCollisions = true,
  collisionBoundary,
  collisionPadding = 0,
  arrowPadding = 0,
  sticky = 'partial',
  hideWhenDetached = false,
  forceMount,
  onEscapeKeyDown,
  onPointerDownOutside,
}) => {
  return (
    <TooltipPrimitive.Portal forceMount={forceMount ? true : undefined}>
      <TooltipPrimitive.Content
        className={clsx(styles.content, className)}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        arrowPadding={arrowPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

TooltipContent.displayName = 'TooltipContent';

export interface TooltipArrowProps {
  className?: string;
  width?: number;
  height?: number;
}

export const TooltipArrow: FC<TooltipArrowProps> = ({
  className,
  width = DEFAULT_ARROW_WIDTH,
  height = DEFAULT_ARROW_HEIGHT,
}) => {
  return <TooltipPrimitive.Arrow className={clsx(styles.arrow, className)} width={width} height={height} />;
};

TooltipArrow.displayName = 'TooltipArrow';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  showArrow?: boolean;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  arrowClassName?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  open: controlledOpen,
  defaultOpen,
  onOpenChange: controlledOnOpenChange,
  delayDuration,
  disableHoverableContent,
  side = 'top',
  sideOffset = DEFAULT_SIDE_OFFSET,
  align = 'center',
  alignOffset = DEFAULT_ALIGN_OFFSET,
  showArrow = true,
  contentClassName,
  triggerClassName,
  arrowClassName,
}) => {
  const [isTouch] = useState<boolean>(() => isTouchDevice());
  const [internalOpen, setInternalOpen] = useState<boolean>(false);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean): void => {
    if (isControlled) {
      controlledOnOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // На мобильных устройствах используем controlled state с мгновенным показом
  const mobileDelayDuration = isTouch ? MOBILE_DELAY_DURATION : delayDuration;
  const mobileDisableHoverableContent = isTouch ? true : disableHoverableContent;

  const handleTriggerClick = (): void => {
    if (isTouch) {
      handleOpenChange(!open);
    }
  };

  return (
    <TooltipRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      delayDuration={mobileDelayDuration}
      disableHoverableContent={mobileDisableHoverableContent}
    >
      <TooltipTrigger className={triggerClassName} asChild onClick={isTouch ? handleTriggerClick : undefined}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        className={contentClassName}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        onPointerDownOutside={isTouch ? () => handleOpenChange(false) : undefined}
      >
        {content}
        {showArrow && <TooltipArrow className={arrowClassName} />}
      </TooltipContent>
    </TooltipRoot>
  );
};

Tooltip.displayName = 'Tooltip';
