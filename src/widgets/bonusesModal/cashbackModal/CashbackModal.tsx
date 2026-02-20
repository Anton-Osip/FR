import { CSSProperties, FC, ReactNode, useCallback, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import bonusesHeaderMonthlyBg from '@shared/assets/icons/BonusesHeaderMonthlyBg.svg?url';
import bonusesHeaderWeeklyBg from '@shared/assets/icons/BonusesHeaderWeeklyBg.svg?url';
import { Button, Modal } from '@shared/ui';

import styles from './CashbackModal.module.scss';

type CashbackPeriod = 'monthly' | 'weekly';

interface CashbackContent {
  id: string;
  title: string;
  description: string;
}

interface CashbackModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  cashbackPeriod: CashbackPeriod;
}

export const CashbackModal: FC<CashbackModalProps> = ({ trigger, open, onOpenChange, cashbackPeriod }) => {
  const { t } = useTranslation('bonuses');
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const swipeCloseElementRef = useRef<HTMLDivElement | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean): void => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChange],
  );
  const content: CashbackContent[] = [
    {
      id: '1',
      title: t('cashbackModal.fields.minRank'),
      description: t(`cashbackModal.${cashbackPeriod}.minRankValue`),
    },
    {
      id: '2',
      title: t('cashbackModal.fields.wager'),
      description: t('cashbackModal.fields.wagerValue'),
    },
    {
      id: '3',
      title: t('cashbackModal.fields.hours'),
      description: t('cashbackModal.fields.hoursValue'),
    },
    {
      id: '4',
      title: t('cashbackModal.fields.balanceType'),
      description: t('cashbackModal.fields.balanceTypeValue'),
    },
    {
      id: '5',
      title: t('cashbackModal.fields.period'),
      description: t(`cashbackModal.${cashbackPeriod}.periodValue`),
    },
  ];

  return (
    <Modal
      trigger={trigger}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
      swipeCloseElementRef={swipeCloseElementRef}
    >
      <div className={styles.container}>
        <header
          className={styles.header}
          ref={swipeCloseElementRef}
          style={
            {
              '--image-url': `url(${cashbackPeriod === 'weekly' ? bonusesHeaderWeeklyBg : bonusesHeaderMonthlyBg})`,
            } as CSSProperties
          }
        >
          <h3 className={styles.title}>{t(`cashbackModal.${cashbackPeriod}.title`)}</h3>
        </header>
        <div className={styles.body}>
          {content.map(item => (
            <div className={styles.item} key={item.id}>
              <h4 className={styles.title}>{item.title}</h4>
              <p className={styles.description}>{item.description}</p>
            </div>
          ))}
        </div>
        <footer className={styles.footer}>
          <Button variant={'primary'} size={'m'} fullWidth onClick={() => handleOpenChange(false)}>
            {t('cashbackModal.closeButton')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};
