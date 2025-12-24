import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/button';
import { SupportIcon } from '@shared/ui/icons';

import styles from './FooterSupport.module.scss';

interface Props {
  className?: string;
}

export const FooterSupport: FC<Props> = ({ className }) => {
  const { t } = useTranslation('footer');

  return (
    <div className={`${styles['footer-support']} ${className ? styles[className] : ''}`}>
      <h3>
        {t('support.title')} <span className={styles['footer-support-time']}>24/7</span>
      </h3>
      <Button size="s" icon={<SupportIcon />} variant="secondary">
        {t('support.write')}
      </Button>
    </div>
  );
};
