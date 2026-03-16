import { FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LessMethodsIcon, MoreMethodsIcon } from '@shared/ui/icons';

import styles from './MoreMethods.module.scss';

interface MoreMethodsProps {
  className?: string;
  quantity: number;
  onClick?: () => void;
  isMore: boolean;
}

const QUANTITY_PROPS = 5;
const SLICE_QUANTITY = 3;

export const MoreMethods: FC<MoreMethodsProps> = ({ className, quantity, isMore, onClick = () => {} }) => {
  const { t } = useTranslation('walletModal');

  if (quantity < QUANTITY_PROPS) return null;

  return (
    <div className={clsx(styles.moreMethods, className)} onClick={onClick}>
      <h4 className={styles.title}> {!isMore ? t('moreMethods.showMore') : t('moreMethods.showLess')}</h4>
      <p className={styles.subtitle}>{!isMore && t('moreMethods.moreCount', { count: quantity - SLICE_QUANTITY })}</p>
      <div className={clsx(styles.icon, isMore && styles.less)}>
        {!isMore ? <MoreMethodsIcon /> : <LessMethodsIcon />}
      </div>
    </div>
  );
};
