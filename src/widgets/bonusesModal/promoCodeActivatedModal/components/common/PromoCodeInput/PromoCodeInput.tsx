import { FC, useCallback, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@shared/lib';
import { Input } from '@shared/ui';
import { CheckIcon, CopyIcon } from '@shared/ui/icons';

import styles from './PromoCodeInput.module.scss';

interface PromoCodeInputProps {
  code: string;
}

const COPY_FEEDBACK_DURATION = 2000;

export const PromoCodeInput: FC<PromoCodeInputProps> = ({ code }) => {
  const { t } = useTranslation('promoCodeActivatedModal');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async (): Promise<void> => {
    await copyToClipboard(
      code,
      'Промокод скопирован',
      'Промокод скопирован в буфер обмена',
      'Не удалось скопировать промокод',
      'Попробуйте еще раз',
    );
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  }, [code]);

  return (
    <div className={styles.promoCode}>
      <label className={styles.label}>{t('promoCode')}</label>
      <Input
        value={code}
        readOnly
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        iconPosition="end"
        onIconClick={handleCopyCode}
        className={clsx(styles.promoInput, { [styles.copied]: copied })}
      />
    </div>
  );
};
