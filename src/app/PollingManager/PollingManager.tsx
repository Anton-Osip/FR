import { useEffect, useRef, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@shared/api';
import { toast } from '@shared/ui';

import { useLazyGetWalletDepositActiveQuery } from '@features/wallet/api/walletApi';
import {
  selectMethodPollingMap,
  // Создайте этот селектор
  setTimerValue,
  setMethodPollingActive,
  setShowModal,
  WALLET_MODAL,
  selectMethodPollingActiveMap,
  setPaymentDetailsError,
} from '@features/wallet/model';

const POLLING_INTERVAL_MS = 5000; // 5 секунд для запросов
const TIMER_DELAY = 1000; // 1 секунда для таймера

export const PollingManager = (): null => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('walletModal');

  // Разделяем состояние на два селектора
  const methodsPollingMap = useSelector(selectMethodPollingMap); // полный стейт (обновляется каждую секунду)
  const activeMethodsForPolling = useSelector(selectMethodPollingActiveMap);

  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pollingIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const pollingStatusRef = useRef<Map<string, boolean>>(new Map()); // Для отслеживания запущенных polling'ов

  const [fetchWalletDepositActive] = useLazyGetWalletDepositActiveQuery();

  const executePolling = useCallback(
    async (method: string): Promise<void> => {
      // Проверяем, активен ли еще метод
      const isActive = pollingStatusRef.current.get(method);

      if (!isActive) {
        return;
      }

      try {
        const { data } = await fetchWalletDepositActive({ method });

        if (data) {
          // Останавливаем polling
          const interval = pollingIntervalsRef.current.get(method);

          if (interval) {
            clearInterval(interval);
            pollingIntervalsRef.current.delete(method);
          }
          pollingStatusRef.current.delete(method);

          // Останавливаем таймер
          const timeout = timeoutsRef.current.get(method);

          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(method);
          }

          toast.success(t('polling.success.title'), t('polling.success.description'));

          dispatch(setTimerValue({ method, value: 0 }));
          dispatch(setMethodPollingActive({ method, value: false }));
          dispatch(setShowModal({ showModal: WALLET_MODAL.SBP_PAYMENT_DETAIL_CONTENT }));
        }
      } catch (error) {
        console.error(`PollingManager: ошибка при запросе для метода ${method}:`, error);
      }
    },
    [dispatch, fetchWalletDepositActive, t],
  );

  // Эффект 1: Управление polling запросами (зависит ТОЛЬКО от activeMethodsForPolling)
  useEffect(() => {
    const activeMethods = Object.entries(activeMethodsForPolling || {})
      .filter(([, value]) => value)
      .map(([method]) => method);

    // Очищаем интервалы для неактивных методов
    pollingIntervalsRef.current.forEach((_, method) => {
      if (!activeMethods.includes(method)) {
        const interval = pollingIntervalsRef.current.get(method);

        if (interval) {
          clearInterval(interval);
          pollingIntervalsRef.current.delete(method);
        }
        pollingStatusRef.current.delete(method);
      }
    });

    // Запускаем polling для активных методов
    activeMethods.forEach(method => {
      if (pollingIntervalsRef.current.has(method)) {
        return;
      }

      // Отмечаем метод как активный
      pollingStatusRef.current.set(method, true);

      // Немедленный вызов
      executePolling(method);

      // Запускаем интервал
      const intervalId = setInterval(() => {
        executePolling(method);
      }, POLLING_INTERVAL_MS);

      pollingIntervalsRef.current.set(method, intervalId);
    });

    return () => {
      // Очистка не нужна здесь, так как каждый вызов useEffect делает свою очистку
    };
  }, [activeMethodsForPolling, executePolling]); // Зависим только от activeMethodsForPolling

  // Эффект 2: Управление таймером (зависит от полного methodsPollingMap)
  useEffect(() => {
    Object.entries(methodsPollingMap || {}).forEach(([method, state]) => {
      if (!state.isPollingActive) {
        if (timeoutsRef.current.has(method)) {
          clearTimeout(timeoutsRef.current.get(method));
          timeoutsRef.current.delete(method);
        }

        return;
      }

      const { timer } = state;

      if (timer <= 0) {
        toast.error(t('polling.error.title'), t('polling.error.description'));
        dispatch(setPaymentDetailsError({ method, value: true }));
        // Останавливаем поллинг
        const interval = pollingIntervalsRef.current.get(method);

        if (interval) {
          clearInterval(interval);
          pollingIntervalsRef.current.delete(method);
        }
        pollingStatusRef.current.delete(method);

        // Очищаем таймер
        if (timeoutsRef.current.has(method)) {
          clearTimeout(timeoutsRef.current.get(method));
          timeoutsRef.current.delete(method);
        }

        dispatch(setMethodPollingActive({ method, value: false }));

        return;
      }

      if (timeoutsRef.current.has(method)) {
        return;
      }

      const timeoutId = setTimeout(() => {
        dispatch(setTimerValue({ method, value: timer - 1 }));
        timeoutsRef.current.delete(method);
      }, TIMER_DELAY);

      timeoutsRef.current.set(method, timeoutId);
    });

    return () => {
      // Очистка при размонтировании
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.clear();
    };
  }, [methodsPollingMap, dispatch, t]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach(interval => clearInterval(interval));
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pollingIntervalsRef.current.clear();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pollingStatusRef.current.clear();
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.clear();
    };
  }, []);

  return null;
};
