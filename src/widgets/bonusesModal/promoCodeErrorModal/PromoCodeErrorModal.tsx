import { FC, ReactElement, ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { APP_PATH } from '@shared/config';
import { formatLocalizedDateTime } from '@shared/lib/dateFormatter';
import { Button, Modal } from '@shared/ui';

import { BonusInfoItem } from '@widgets/bonusesModal/promoCodeActivatedModal/components/common/BonusInfoItem';
import { PromoCodeInput } from '@widgets/bonusesModal/promoCodeActivatedModal/components/common/PromoCodeInput';
import { SlotInfo } from '@widgets/bonusesModal/promoCodeActivatedModal/components/SlotInfo';

import styles from './PromoCodeErrorModal.module.scss';
import { getErrorMessage, PromoErrorCode } from './utils/getErrorMessage';

import type { RedeemPromoError } from '@features/bonus/model';

interface PromoCodeErrorModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  error: RedeemPromoError;
}

export const PromoCodeErrorModal: FC<PromoCodeErrorModalProps> = ({ trigger, open, onOpenChange, error }) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const navigate = useNavigate();
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

  // Извлекаем код ошибки и данные в зависимости от формата detail
  const { errorCode, errorMessage, currentPromo, slot } = useMemo(() => {
    const code = typeof error.data.detail === 'string' ? error.data.detail : error.data.detail.code;
    const promo = typeof error.data.detail === 'object' ? error.data.detail.current : undefined;
    const gameSlot = typeof error.data.detail === 'object' ? error.data.detail.slot : null;

    return {
      errorCode: code,
      errorMessage: getErrorMessage(code),
      currentPromo: promo,
      slot: gameSlot,
    };
  }, [error.data.detail]);

  const hasSlot = !!slot;
  const hasCurrent = !!currentPromo;

  const handleClose = (): void => {
    handleOpenChange(false);
  };

  const handleGoToSlot = (): void => {
    handleClose();
    if (slot) {
      const gamePath = APP_PATH.slot.replace(':id', slot.uuid);

      navigate(gamePath);
    }
  };

  const handleGoToDeposit = (): void => {
    handleClose();
  };

  // Случай с активным депозитным промокодом (reserved_exists)
  const isReservedExists = errorCode === PromoErrorCode.RESERVED_EXISTS && hasCurrent;

  const renderCurrentPromoInfo = (): ReactElement | null => {
    if (!currentPromo) return null;

    const current = currentPromo;

    return (
      <>
        <p className={styles.description}>Текущий активный промо:</p>
        <PromoCodeInput code={current.code} />

        {current.reward_type === 'freespins' && current.freespins?.slot && <SlotInfo slot={current.freespins.slot} />}

        <div className={styles.bonusInfo}>
          <BonusInfoItem
            label="Тип награды"
            value={
              current.reward_type === 'funds'
                ? 'Фиксированная сумма'
                : current.reward_type === 'percent'
                  ? 'Процент'
                  : 'Фриспины'
            }
          />

          {current.reward_type === 'funds' && current.amount && (
            <BonusInfoItem label="Сумма бонуса" value={current.amount} />
          )}

          {current.reward_type === 'percent' && current.percent && (
            <BonusInfoItem label="Процент бонуса" value={`+${current.percent}%`} />
          )}

          {current.reward_type === 'freespins' && current.freespins && (
            <>
              <BonusInfoItem label="Количество фриспинов" value={current.freespins.quantity} />
              <BonusInfoItem
                label="Номинал ставки"
                value={current.freespins.denomination}
                hidden={!current.freespins.denomination}
              />
            </>
          )}

          <BonusInfoItem label="Минимальный депозит" value={current.min_deposit} hidden={!current.min_deposit} />
          <BonusInfoItem
            label="Доступно до"
            value={current.deadline_ts ? formatLocalizedDateTime(current.deadline_ts) : ''}
            hidden={!current.deadline_ts}
          />
          <BonusInfoItem label="Вейджер" value={`x${current.wager_mult}`} />
          <BonusInfoItem label="Срок отыгрыша" value={`${current.wager_ttl_days} дней`} />
        </div>
      </>
    );
  };

  return (
    <Modal
      trigger={trigger}
      open={isOpen}
      showCloseButton={true}
      onOpenChange={handleOpenChange}
      contentClassName={styles.modal}
      closeButtonClassName={styles.closeButton}
    >
      <div className={styles.container}>
        <header className={styles.header} ref={swipeCloseElementRef}>
          <h3 className={styles.title}>Ошибка</h3>
        </header>
        <div className={styles.body}>
          <p className={styles.errorMessage}>{errorMessage}</p>

          {isReservedExists && (
            <>
              {renderCurrentPromoInfo()}
              <Button variant="primary" size="m" fullWidth onClick={handleGoToDeposit}>
                Перейти к пополнению
              </Button>
            </>
          )}

          {hasSlot && slot && (
            <>
              <SlotInfo slot={slot} onClose={handleClose} />
              <Button variant="primary" size="m" fullWidth onClick={handleGoToSlot}>
                Перейти к игре
              </Button>
            </>
          )}

          {!hasSlot && !isReservedExists && (
            <Button variant="primary" size="m" fullWidth onClick={handleClose}>
              Закрыть
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
