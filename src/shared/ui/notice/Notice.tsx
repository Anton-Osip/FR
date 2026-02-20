import { type FC, type ForwardRefExoticComponent, type ReactNode, type RefAttributes, type SVGProps } from 'react';

import type { IconProps } from '@radix-ui/react-icons/dist/types';
import clsx from 'clsx';

import { InfoIcon, WarningIcon } from '@shared/ui/icons';
import { Tooltip, TooltipProvider } from '@shared/ui/tooltip';

import styles from './Notice.module.scss';

type IconType = FC<SVGProps<SVGSVGElement>> | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

interface Props {
  className?: string;
  variant?: 'info' | 'warning';
  text: string;
  tooltip?: string;
  title?: string;
  icon?: ReactNode | IconType;
}

export const Notice: FC<Props> = ({ className, variant = 'info', text, tooltip, title, icon: Icon }) => {
  const tooltipIcon = (
    <div className={styles.tooltipIcon}>
      <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 0H3.33333C1.33333 0 0 1.33333 0 3.33333V7.33333C0 9.33333 1.33333 10.6667 3.33333 10.6667V12.0867C3.33333 12.62 3.92667 12.94 4.36667 12.64L7.33333 10.6667H10C12 10.6667 13.3333 9.33333 13.3333 7.33333V3.33333C13.3333 1.33333 12 0 10 0ZM6.66667 8.11333C6.38667 8.11333 6.16667 7.88667 6.16667 7.61333C6.16667 7.34 6.38667 7.11333 6.66667 7.11333C6.94667 7.11333 7.16667 7.34 7.16667 7.61333C7.16667 7.88667 6.94667 8.11333 6.66667 8.11333ZM7.50667 5.34667C7.24667 5.52 7.16667 5.63333 7.16667 5.82V5.96C7.16667 6.23333 6.94 6.46 6.66667 6.46C6.39333 6.46 6.16667 6.23333 6.16667 5.96V5.82C6.16667 5.04667 6.73333 4.66667 6.94667 4.52C7.19333 4.35333 7.27333 4.24 7.27333 4.06667C7.27333 3.73333 7 3.46 6.66667 3.46C6.33333 3.46 6.06 3.73333 6.06 4.06667C6.06 4.34 5.83333 4.56667 5.56 4.56667C5.28667 4.56667 5.06 4.34 5.06 4.06667C5.06 3.18 5.78 2.46 6.66667 2.46C7.55333 2.46 8.27333 3.18 8.27333 4.06667C8.27333 4.82667 7.71333 5.20667 7.50667 5.34667Z"
          fill="#727E9B"
        />
      </svg>
    </div>
  );

  const renderIcon = (): ReactNode => {
    if (!Icon) {
      if (variant === 'info') return <InfoIcon />;
      if (variant === 'warning') return <WarningIcon />;
    }

    if (typeof Icon === 'function' || (Icon && typeof Icon === 'object' && 'render' in Icon)) {
      const IconComponent = Icon as IconType;

      return <IconComponent className={styles.buttonIcon} />;
    }

    return <span className={styles.buttonIcon}>{Icon}</span>;
  };

  return (
    <TooltipProvider>
      <div className={clsx(styles.container, styles[variant], tooltip && styles.tooltipWrapper, className)}>
        <div className={styles.icon}>{renderIcon()}</div>
        <div className={styles.text}>
          {title && <h4 className={styles.title}>{title}</h4>}
          <p className={styles.value}>{text}</p>
        </div>

        {tooltip ? (
          <Tooltip content={tooltip} side="top" sideOffset={24} showArrow={false}>
            {tooltipIcon}
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
};
