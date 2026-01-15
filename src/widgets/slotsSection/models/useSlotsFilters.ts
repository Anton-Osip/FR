import { ChangeEvent, useCallback, useState } from 'react';

import type { DropdownMenuItems } from '@shared/ui/dropdown/Dropdown.tsx';
import { FireIcon, LikeIcon, StarIcon } from '@shared/ui/icons';

export const POPULAR_OPTIONS: DropdownMenuItems[] = [
  { id: 'recommended', title: 'Рекомендуемые', icon: LikeIcon },
  { id: 'new', title: 'Новые', icon: StarIcon },
  { id: 'popular', title: 'Популярные', icon: FireIcon },
];

export const PROVIDER_OPTIONS: DropdownMenuItems[] = [
  { id: 'all', title: 'Все провайдеры' },
  { id: 'Aprovider', title: 'Aprovider' },
  { id: 'Bprovider', title: 'Bprovider Bprovider' },
  { id: 'Cprovider', title: 'Cprovider' },
  { id: 'Dprovider', title: 'Dprovider' },
];

interface UseSlotsFiltersReturn {
  providerFilter: string | string[];
  popularFilter: string;
  searchValue: string;
  handleProviderChange: (option: DropdownMenuItems | DropdownMenuItems[]) => void;
  handlePopularChange: (option: DropdownMenuItems | DropdownMenuItems[]) => void;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const useSlotsFilters = (): UseSlotsFiltersReturn => {
  const [providerFilter, setProviderFilter] = useState<string | string[]>('all');
  const [popularFilter, setPopularFilter] = useState<string>('popular');
  const [searchValue, setSearchValue] = useState<string>('');

  const handleProviderChange = useCallback((option: DropdownMenuItems | DropdownMenuItems[]) => {
    if (Array.isArray(option)) {
      const values = option.map(opt => opt.id);

      if (values.includes('all') || values.length === 0) {
        setProviderFilter('all');
      } else {
        setProviderFilter(values);
      }
    } else {
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

  return {
    providerFilter,
    popularFilter,
    searchValue,
    handleProviderChange,
    handlePopularChange,
    handleSearchChange,
  };
};
