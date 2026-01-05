import { type FC, useMemo } from 'react';

import * as Separator from '@radix-ui/react-separator';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Brand, Button } from '@shared/ui';
import { TgIcon } from '@shared/ui/icons';

import { getFooterBanking, getFooterCrypto, getFooterMenu } from './constants/constants';
import styles from './Footer.module.scss';
import { FooterMenu } from './FooterMenu/FooterMenu';
import { FooterMoneyItem } from './FooterMoneyItem/FooterMoneyItem';
import { FooterSupport } from './FooterSupport/FooterSupport';

interface FooterProps {
  className?: string;
}

export const Footer: FC<FooterProps> = ({ className }) => {
  const { t } = useTranslation('footer');

  const footerMenu = useMemo(() => getFooterMenu(t), [t]);
  const footerBanking = useMemo(() => getFooterBanking(), []);
  const footerCrypto = useMemo(() => getFooterCrypto(), []);

  return (
    <footer className={clsx(styles.footer, className)}>
      <div className={styles.footerGrid}>
        <Brand className={styles.logo} />
        <p className={styles.footerRight}>{t('rights')}</p>
        <Button className={styles.footerTelegram} icon={<TgIcon />} size="s" variant="secondary">
          {t('telegramChannel')}
        </Button>
        <Separator.Root className={`${styles.separator} ${styles.separatorMenu}`} />
        <FooterMenu className={styles.footerMenu} items={footerMenu} />
        <div className={styles.footerSupport}>
          <FooterSupport />
        </div>
        <Separator.Root className={`${styles.separator} ${styles.separatorMoney}`} />
        <div className={styles.footerMoney}>
          <FooterMoneyItem text={t('banking')} items={footerBanking} />
          <FooterMoneyItem text={t('crypto')} items={footerCrypto} />
        </div>
        <Separator.Root className={`${styles.separator} ${styles.separatorSupport}`} />
        <p className={styles.footerLtdText}>{t('ltdText')}</p>
      </div>
    </footer>
  );
};
