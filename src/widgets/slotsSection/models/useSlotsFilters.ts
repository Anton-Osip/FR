import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { DropdownMenuItems } from '@shared/ui/dropdownApp/DropdownApp.tsx';
import { FireIcon, LikeIcon, StarIcon } from '@shared/ui/icons';

import { useGetShowcaseProvidersQuery } from '@/features/showcase/api/showcaseApi';

const DEFAULT_PROVIDER_FILTER = 'all';
const DEFAULT_POPULAR_FILTER = 'featured';

export const usePopularOptions = (): DropdownMenuItems[] => {
  const { t } = useTranslation('slots');

  return useMemo(
    () => [
      { id: 'featured', title: t('filters.popular.featured'), icon: LikeIcon },
      { id: 'new', title: t('filters.popular.new'), icon: StarIcon },
      { id: 'popular', title: t('filters.popular.popular'), icon: FireIcon },
    ],
    [t],
  );
};

export const useProviderOptions = (): DropdownMenuItems[] => {
  const { t } = useTranslation('slots');
  const { data: providers } = useGetShowcaseProvidersQuery();

  return useMemo(() => {
    const allProvidersOption: DropdownMenuItems = { id: 'all', title: t('filters.provider.all') };

    if (!providers || providers.length === 0) {
      return [allProvidersOption];
    }

    const providerOptions: DropdownMenuItems[] = providers.map(provider => ({
      id: String(provider.id),
      title: provider.name,
    }));

    return [allProvidersOption, ...providerOptions];
  }, [providers, t]);
};

interface UseSlotsFiltersReturn {
  providerFilter: string;
  popularFilter: string;
  searchValue: string;
  handleProviderChange: (option: DropdownMenuItems | DropdownMenuItems[]) => void;
  handlePopularChange: (option: DropdownMenuItems | DropdownMenuItems[]) => void;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetFilters: () => void;
}

export const useSlotsFilters = (): UseSlotsFiltersReturn => {
  const [providerFilter, setProviderFilter] = useState<string>(DEFAULT_PROVIDER_FILTER);
  const [popularFilter, setPopularFilter] = useState<string>(DEFAULT_POPULAR_FILTER);
  const [searchValue, setSearchValue] = useState<string>('');

  const handleProviderChange = useCallback((option: DropdownMenuItems | DropdownMenuItems[]) => {
    if (!Array.isArray(option)) {
      setProviderFilter(option.id);
    }
  }, []);

  const handlePopularChange = useCallback((option: DropdownMenuItems | DropdownMenuItems[]) => {
    if (!Array.isArray(option)) {
      setPopularFilter(option.id);
    }
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const resetFilters = useCallback(() => {
    setProviderFilter(DEFAULT_PROVIDER_FILTER);
    setPopularFilter(DEFAULT_POPULAR_FILTER);
    setSearchValue('');
  }, []);

  return {
    providerFilter,
    popularFilter,
    searchValue,
    handleProviderChange,
    handlePopularChange,
    handleSearchChange,
    resetFilters,
  };
};
