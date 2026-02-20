import { FC, type ReactNode, useState } from 'react';

import { Button, Modal, Notice } from '@shared/ui';

import styles from './BonusTermsModal.module.scss';

interface Props {
  trigger?: ReactNode;
  portalContainer: Element | DocumentFragment | null;
}

export const BonusTermsModal: FC<Props> = ({ trigger, portalContainer }) => {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      showCloseButton
      overlayClassName={styles.overlay}
      contentClassName={styles.content}
      bodyClassName={styles.body}
      closeButtonClassName={styles.closeButton}
      headerClassName={styles.headerClassName}
      portalContainer={portalContainer}
      title={
        <header className={styles.header}>
          <h3 className={styles.title}>Условия бонуса +&nbsp;50%</h3>
        </header>
      }
    >
      <>
        <div className={styles.infoWrapper}>
          <div className={styles.item}>
            <h3 className={styles.title}>Минимальная сумма депозита</h3>
            <p className={styles.value}>5$</p>
          </div>
          <div className={styles.item}>
            <h3 className={styles.title}>Вейджер для бонуса на депозит</h3>
            <p className={styles.value}>x40</p>
          </div>
          <div className={styles.item}>
            <h3 className={styles.title}>Максимальная сумма выигрыша</h3>
            <p className={styles.value}>
              15-кратная сумма бонуса или 500S (в зависимости от того, что наступит раньше)
            </p>
          </div>
          <div className={styles.item}>
            <h3 className={styles.title}>Максимальная сумма ставки</h3>
            <p className={styles.value}>3.5$</p>
          </div>
          <div className={styles.item}>
            <h3 className={styles.title}>Время на отыгрыш</h3>
            <p className={styles.value}>96 часов</p>
          </div>
        </div>
        <div className={styles.infoNotes}>
          <h2 className={styles.title}>Будьте внимательны</h2>
          <Notice
            text={'Доступно только для некоторых игр'}
            tooltip={
              'Доступные игры: Cleocatra, Gems Bonanza, Power of Thor Megaways, The Dog House Megaways Mobile, Zeus vs Hades - Gods of War'
            }
          />
          <Notice text={'При выводе средств с реального баланса все неотыгранные бонусы и фриспины сгорают'} />
          <Notice text={'Отыгрыш вейджера происходит сначала с реального баланса, затем с бонусного'} />
        </div>

        <Button variant={'primary'} fullWidth onClick={() => setOpen(false)}>
          Закрыть
        </Button>
      </>
    </Modal>
  );
};
