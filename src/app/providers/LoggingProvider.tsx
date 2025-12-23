'use client';

import { useEffect } from 'react';

import { initLogging } from '@/shared/telemetry/initLogging';

export const LoggingProvider = (): null => {
  useEffect(() => {
    initLogging();
  }, []);

  return null;
};
