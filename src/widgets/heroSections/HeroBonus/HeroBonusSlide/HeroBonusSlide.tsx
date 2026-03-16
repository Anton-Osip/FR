import { type FC } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import animation from '@shared/assets/images/hero-bonus.webp';
import { Button } from '@shared/ui';

import styles from './HeroBonusSlide.module.scss';

import { useWalletModalUrl } from '@features/wallet/model';

export const HeroBonusSled: FC = () => {
  const { t } = useTranslation('home');
  const { openModal: openWalletModal } = useWalletModalUrl();

  return (
    <div className={styles.heroBonus} onClick={openWalletModal}>
      <h3 className={styles.title}>
        {t('heroBonus.title')}
        <br /> {t('heroBonus.titleSecondLine')}
      </h3>

      <Button className={clsx(styles['hero-bonus-button'], 'swiper-no-swiping')}>{t('heroBonus.button')}</Button>
      <div className={styles.bonusAnimation}>
        <img src={animation} alt="bonus-animation" />
      </div>
    </div>
  );
};
