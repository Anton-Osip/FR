import { FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@shared/api';
import { toast } from '@shared/ui';

import styles from './SbpTimerBlock.module.scss';

import { setDepositData, setShowModal, WALLET_MODAL } from '@features/wallet/model';

interface SbpTimerBlockProps {
  expiresAt?: number; // UNIX timestamp в секундах
}

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const PAD_LENGTH = 2;
const MILLISECONDS_PER_SECOND = 1000;
const UPDATE_INTERVAL_MS = 1000;

const calculateTimeLeft = (expiresAt: number): number => {
  const now = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
  const remaining = expiresAt - now;

  return remaining > 0 ? remaining : 0;
};

const formatTime = (seconds: number, locale: string): string => {
  const normalizedLocale = locale.toLowerCase();
  const isRussian = normalizedLocale.startsWith('ru');

  if (seconds <= 0) {
    if (!isRussian) {
      return '00h : 00m : 00s';
    }

    return '00ч : 00м : 00с';
  }

  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = seconds % SECONDS_PER_MINUTE;

  const paddedHours = String(hours).padStart(PAD_LENGTH, '0');
  const paddedMinutes = String(minutes).padStart(PAD_LENGTH, '0');
  const paddedSeconds = String(secs).padStart(PAD_LENGTH, '0');

  if (isRussian) {
    return `${paddedHours}ч : ${paddedMinutes}м : ${paddedSeconds}с`;
  }

  return `${paddedHours}h : ${paddedMinutes}m : ${paddedSeconds}s`;
};

export const SbpTimerBlock: FC<SbpTimerBlockProps> = ({ expiresAt }) => {
  const { t, i18n } = useTranslation('walletModal');
  const [timeLeft, setTimeLeft] = useState<number | null>(() => (expiresAt ? calculateTimeLeft(expiresAt) : null));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (timeLeft === 0) {
      toast.info(t('sbpTimer.paymentNotConfirmed.title'), t('sbpTimer.paymentNotConfirmed.description'));
      dispatch(setDepositData({ data: null }));
      dispatch(setShowModal({ showModal: WALLET_MODAL.WALLET }));
    }
  }, [dispatch, timeLeft, t]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    // Обновляем каждую секунду
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(expiresAt);

      setTimeLeft(remaining);

      // Останавливаем таймер, когда время истекло
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>{t('sbpTimer.waitingForTransfer')}</p>
      <div className={styles.timer}>{formatTime(timeLeft || 0, i18n.language)}</div>
    </div>
  );
};
