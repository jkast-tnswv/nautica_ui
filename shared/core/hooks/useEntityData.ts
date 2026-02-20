import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootState } from '../store';
import type { AsyncThunk } from '@reduxjs/toolkit';
import type { EntityState } from '../store/createEntitySlice';

export interface UseEntityDataOptions<FilterArg> {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: FilterArg;
}

export interface UseEntityDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEntityData<T, FilterArg = void>(
  fetchThunk: AsyncThunk<T[], FilterArg, {}>,
  selector: (state: RootState) => EntityState<T>,
  options: UseEntityDataOptions<FilterArg> = {} as UseEntityDataOptions<FilterArg>,
): UseEntityDataReturn<T> {
  const { autoRefresh = true, refreshInterval = 10000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: data, loading, error } = useAppSelector(selector);

  useEffect(() => {
    dispatch(fetchThunk(filters as FilterArg));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchThunk(filters as FilterArg));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchThunk(filters as FilterArg));
  }, [dispatch, filters]);

  return { data, loading, error, refresh };
}
