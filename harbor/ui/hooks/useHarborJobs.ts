import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import {
  fetchHarborJobs,
  createHarborEmbark,
  createHarborDisembark,
} from '../slices/harborJobsSlice';
import type { HarborResponse } from '@core/gen/harbor/api/harbor_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { HarborRequest, HarborListRequest } from '@core/gen/harbor/api/harbor_pb';
import { addNotification } from '@core/services/notifications';

export interface UseHarborJobsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: PartialMessage<HarborListRequest>;
}

export interface UseHarborJobsReturn {
  jobs: HarborResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  embark: (data: PartialMessage<HarborRequest>) => Promise<boolean>;
  disembark: (data: PartialMessage<HarborRequest>) => Promise<boolean>;
}

export function useHarborJobs(options: UseHarborJobsOptions = {}): UseHarborJobsReturn {
  const { autoRefresh = true, refreshInterval = 5000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: jobs, loading, error } = useAppSelector((state) => state.harborJobs);

  useEffect(() => {
    dispatch(fetchHarborJobs(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchHarborJobs(filters));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchHarborJobs(filters));
  }, [dispatch, filters]);

  const embark = useCallback(
    async (data: PartialMessage<HarborRequest>): Promise<boolean> => {
      try {
        await dispatch(createHarborEmbark(data)).unwrap();
        addNotification('success', `Embark job created for ${data.hostname}`);
        dispatch(fetchHarborJobs(filters));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addNotification('error', `Failed to embark: ${message}`);
        return false;
      }
    },
    [dispatch, filters]
  );

  const disembark = useCallback(
    async (data: PartialMessage<HarborRequest>): Promise<boolean> => {
      try {
        await dispatch(createHarborDisembark(data)).unwrap();
        addNotification('success', `Disembark job created for ${data.hostname}`);
        dispatch(fetchHarborJobs(filters));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addNotification('error', `Failed to disembark: ${message}`);
        return false;
      }
    },
    [dispatch, filters]
  );

  return { jobs, loading, error, refresh, embark, disembark };
}
