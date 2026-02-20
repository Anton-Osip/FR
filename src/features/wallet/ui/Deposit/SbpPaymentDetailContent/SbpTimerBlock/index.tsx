import { FC, useEffect, useState } from 'react';

import styles from './SbpTimerBlock.module.scss';

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

const formatTime = (seconds: number): string => {
  if (seconds <= 0) {
    return '00ч : 00м : 00с';
  }

  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = seconds % SECONDS_PER_MINUTE;

  return `${String(hours).padStart(PAD_LENGTH, '0')}ч : ${String(minutes).padStart(PAD_LENGTH, '0')}м : ${String(secs).padStart(PAD_LENGTH, '0')}с`;
};

export const SbpTimerBlock: FC<SbpTimerBlockProps> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => (expiresAt ? calculateTimeLeft(expiresAt) : 0));

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
      <p className={styles.text}>Ожидаем ваш перевод</p>
      <div className={styles.timer}>{formatTime(timeLeft)}</div>
    </div>
  );
};
