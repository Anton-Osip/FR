import { useCallback } from 'react';

import { useUserGeoCountry } from '../api/userApi';

export const useCountryIsBlocked = (): ((blockedCountries: string[] | undefined) => boolean) => {
  const { data: geo } = useUserGeoCountry();

  return useCallback(
    (blockedCountries: string[] | undefined = []): boolean => {
      if (!geo?.country_code || !Array.isArray(blockedCountries) || blockedCountries.length === 0) {
        return false;
      }

      const userCountry = geo.country_code.toUpperCase();

      return blockedCountries.some(country => country?.toUpperCase() === userCountry);
    },
    [geo],
  );
};
