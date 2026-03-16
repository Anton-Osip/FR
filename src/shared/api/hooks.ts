import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { RootState, AppDispatch } from '@app/store';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
