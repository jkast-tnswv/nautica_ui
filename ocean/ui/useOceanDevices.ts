import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { fetchOceanDevices } from './oceanDevicesSlice';
import type { OceanDevice } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanDeviceListRequest } from '@core/gen/ocean/api/ocean_pb';

export interface UseOceanDevicesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: PartialMessage<OceanDeviceListRequest>;
}

export interface UseOceanDevicesReturn {
  devices: OceanDevice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOceanDevices(options: UseOceanDevicesOptions = {}): UseOceanDevicesReturn {
  const { autoRefresh = true, refreshInterval = 10000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: devices, loading, error } = useAppSelector((state) => state.oceanDevices);

  useEffect(() => {
    dispatch(fetchOceanDevices(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchOceanDevices(filters));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchOceanDevices(filters));
  }, [dispatch, filters]);

  return { devices, loading, error, refresh };
}
