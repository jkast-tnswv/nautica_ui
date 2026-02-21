import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { AsyncThunk } from '@reduxjs/toolkit';

interface EntityStateShape<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

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
  fetchThunk: AsyncThunk<T[], any, any>,
  selector: (state: any) => EntityStateShape<T>,
  options: UseEntityDataOptions<FilterArg> = {} as UseEntityDataOptions<FilterArg>,
): UseEntityDataReturn<T> {
  const { autoRefresh = true, refreshInterval = 10000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: data, loading, error } = useAppSelector(selector);

  useEffect(() => {
    dispatch(fetchThunk(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchThunk(filters));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchThunk(filters));
  }, [dispatch, filters]);

  return { data, loading, error, refresh };
}
