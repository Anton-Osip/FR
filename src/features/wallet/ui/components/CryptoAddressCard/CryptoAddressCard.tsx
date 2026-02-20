import { type FC, useState } from 'react';

import clsx from 'clsx';
import { QRCodeCanvas } from 'qrcode.react';

import { copyToClipboard } from '@shared/lib';
import { Button } from '@shared/ui';
import { CopyIcon, MaximizeIcon, MinimizeIcon } from '@shared/ui/icons';

import styles from './CryptoAddressCard.module.scss';

export interface CryptoAddressCardProps {
  className?: string;
  title: string;
  value: string;
  isLoading?: boolean;
}

const QR_CODE_SIZE_COLLAPSED = 56;
const QR_CODE_SIZE_EXPANDED = 188;
const QR_CODE_BG_COLOR = '#000000';
const QR_CODE_FG_COLOR = '#FFFFFF';
const QR_CODE_ERROR_LEVEL = 'Q';

export const CryptoAddressCard: FC<CryptoAddressCardProps> = ({ className, title, value, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleToggleExpand = (): void => {
    setIsExpanded(prev => !prev);
  };

  const handleCopy = async (): Promise<void> => {
    await copyToClipboard(value, 'Адрес скопирован', 'Адрес скопирован в буфер обмена');
  };

  if (isLoading) return <div className={styles.skeletonItem} />;

  return (
    <div className={clsx(styles.depositDetailItem, className)}>
      <div className={clsx(styles.content, isExpanded && styles.expanded)}>
        <div className={clsx(styles.info, isExpanded && styles.expanded)}>
          <p className={styles.title}>{title}</p>
          <p className={styles.value}>{value}</p>
        </div>
        <div className={clsx(styles.qrContainer, isExpanded && styles.expanded)}>
          <QRCodeCanvas
            value={value}
            size={isExpanded ? QR_CODE_SIZE_EXPANDED : QR_CODE_SIZE_COLLAPSED}
            bgColor={QR_CODE_BG_COLOR}
            fgColor={QR_CODE_FG_COLOR}
            level={QR_CODE_ERROR_LEVEL}
          />
          {!isExpanded && (
            <Button className={styles.maxBtn} icon={MaximizeIcon} variant={'tertiary'} onClick={handleToggleExpand} />
          )}
        </div>
      </div>
      {isExpanded && (
        <Button
          fullWidth
          icon={<MinimizeIcon />}
          variant={'tertiary'}
          onClick={handleToggleExpand}
          className={styles.collapseBtn}
        >
          Свернуть
        </Button>
      )}
      <Button fullWidth icon={<CopyIcon />} className={styles.copyBtn} onClick={handleCopy}>
        Скопировать
      </Button>
    </div>
  );
};
