import { type FC, useMemo } from 'react';

import * as Separator from '@radix-ui/react-separator';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Brand, Button } from '@shared/ui';
import { TgIcon } from '@shared/ui/icons';

import { getFooterBanking, getFooterCrypto, getFooterMenu } from './constants/constants';
import styles from './Footer.module.scss';
import { FooterMenu } from './FooterMenu/FooterMenu';
import { FooterMoneyItem } from './FooterMoneyItem/FooterMoneyItem';
import { FooterSupport } from './FooterSupport/FooterSupport';

import { useGetLinksResolveQuery } from '@features/links';

interface FooterProps {
  className?: string;
}

export const Footer: FC<FooterProps> = ({ className }) => {
  const { t } = useTranslation('footer');
  const navigate = useNavigate();
  const { data: linksResolve } = useGetLinksResolveQuery({});

  const footerMenu = useMemo(
    () => getFooterMenu(t, navigate, String(linksResolve?.links.support), String(linksResolve?.links.affiliate)),
    [t, navigate, linksResolve?.links.support, linksResolve?.links.affiliate],
  );
  const footerBanking = useMemo(() => getFooterBanking(), []);
  const footerCrypto = useMemo(() => getFooterCrypto(), []);

  return (
    <footer className={clsx(styles.footer, className)}>
      <div className={styles.footerGrid}>
        <Brand className={styles.logo} />
        <p className={styles.footerRight}>{t('rights')}</p>
        <Button
          className={styles.footerTelegram}
          icon={<TgIcon />}
          size="s"
          variant="secondary"
          onClick={() => window.open(String(linksResolve?.links.news), '_blank')}
        >
          {t('telegramChannel')}
        </Button>
        <Separator.Root className={clsx(styles.separator, styles.separatorMenu)} />
        <FooterMenu className={styles.footerMenu} items={footerMenu} />
        <div className={styles.footerSupport}>
          <FooterSupport />
        </div>
        <Separator.Root className={clsx(styles.separator, styles.separatorMoney)} />
        <div className={styles.footerMoney}>
          <FooterMoneyItem text={t('banking')} items={footerBanking} />
          <FooterMoneyItem text={t('crypto')} items={footerCrypto} />
        </div>
        <Separator.Root className={clsx(styles.separator, styles.separatorSupport)} />
        <p className={styles.footerLtdText}>{t('ltdText')}</p>
      </div>
    </footer>
  );
};
