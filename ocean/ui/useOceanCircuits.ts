import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { fetchOceanCircuits } from './oceanCircuitsSlice';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanCircuitListRequest } from '@core/gen/ocean/api/ocean_pb';

export interface UseOceanCircuitsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: PartialMessage<OceanCircuitListRequest>;
}

export interface UseOceanCircuitsReturn {
  circuits: OceanCircuit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOceanCircuits(options: UseOceanCircuitsOptions = {}): UseOceanCircuitsReturn {
  const { autoRefresh = true, refreshInterval = 10000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: circuits, loading, error } = useAppSelector((state) => state.oceanCircuits);

  useEffect(() => {
    dispatch(fetchOceanCircuits(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchOceanCircuits(filters));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchOceanCircuits(filters));
  }, [dispatch, filters]);

  return { circuits, loading, error, refresh };
}
