import { type FC, ReactElement, type ReactNode } from 'react';

import clsx from 'clsx';

import { Button } from '@shared/ui';

import styles from './DepositDetailItem.module.scss';

export interface DepositDetailItemProps {
  label: string;
  value: string;
  icon?: ReactNode | string;
  className?: string;
  btnIcon?: ReactNode;
  onClickBtn?: () => void;
}

export const DepositDetailItem: FC<DepositDetailItemProps> = ({
  label,
  value,
  icon,
  className,
  btnIcon,
  onClickBtn,
}) => {
  const renderIcon = (): ReactElement => {
    if (typeof icon === 'string') return <img className={styles.icon} src={icon} alt="icon" />;

    return <div className={styles.icon}>{icon}</div>;
  };

  return (
    <div className={clsx(styles.depositDetailItem, className)}>
      {icon && renderIcon()}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>

      {btnIcon && (
        <Button className={styles.btn} variant={'tertiary'} onClick={onClickBtn}>
          {btnIcon}
        </Button>
      )}
    </div>
  );
};
