import { FC, useState } from 'react';

import clsx from 'clsx';

import { ToggleSwitch } from '@shared/ui';
import { InfoIcon } from '@shared/ui/icons';

import styles from './BonusSection.module.scss';

import { BonusGlow } from '@features/wallet/ui/Deposit/BankPaymentContent/BonusGlow';
import { BonusTermsModal } from '@features/wallet/ui/Deposit/BonusTermsModal';

interface Props {
  disabled?: boolean;
  portalContainer: Element | DocumentFragment | null;
}

export const BonusSection: FC<Props> = ({ disabled = false, portalContainer }) => {
  const [activeBonus, setActiveBonus] = useState<boolean>(true);

  if (disabled) {
    return null;
  }

  return (
    <div className={styles.bonusWrapper}>
      <div className={styles.bg}>
        <BonusGlow />
      </div>
      {activeBonus && (
        <div className={clsx(styles.bonusContent, styles.bonusContainer)}>
          <div className={styles.left}>
            <h4 className={styles.title}>Бонус 50% на депозит</h4>
            <p className={styles.description}>Бонус</p>
          </div>
          <div className={styles.right}>+50%</div>
        </div>
      )}
      <div className={clsx(styles.bonusTrigger, styles.bonusContainer)}>
        <div className={styles.left}>
          <h4 className={styles.title}>Бонус 50% на депозит</h4>

          <BonusTermsModal
            portalContainer={portalContainer}
            trigger={
              <p className={styles.description}>
                <InfoIcon />
                Условия бонуса
              </p>
            }
          />
        </div>
        <div onClick={e => e.stopPropagation()}>
          <ToggleSwitch onToggle={setActiveBonus} isOn={activeBonus} />
        </div>
      </div>
    </div>
  );
};
