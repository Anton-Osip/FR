// src/hooks/usePollingManager.ts
import { useEffect } from 'react'; // Убрали неиспользуемый импорт

import { useSelector } from 'react-redux';

import { useAppDispatch } from '@shared/api';

import { createMethodsPolling, selectMethodPollingMap, setPaymentDetailsError } from '@features/wallet/model';

type UsePollingManager = {
  method: string;
};

type UsePollingManagerReturn = {
  startPolling: () => void;
  isPollingActive: boolean;
  timerValue: number;
  paymentDetailsError: boolean;
};

export const usePollingManager = ({ method }: UsePollingManager): UsePollingManagerReturn => {
  const dispatch = useAppDispatch();
  const methodsPollingMap = useSelector(selectMethodPollingMap);

  const pollingData = methodsPollingMap?.[method];

  const isPollingActive = pollingData?.isPollingActive ?? false;
  const timerValue = pollingData?.timer ?? 0;
  const paymentDetailsError = pollingData?.paymentDetailsError ?? false;

  const startPolling = (): void => {
    dispatch(createMethodsPolling({ method }));
  };

  useEffect(() => {
    return () => {
      dispatch(setPaymentDetailsError({ method, value: false }));
    };
  }, [dispatch, method]);

  return {
    startPolling,
    isPollingActive,
    timerValue,
    paymentDetailsError,
  };
};
