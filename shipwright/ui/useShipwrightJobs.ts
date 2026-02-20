import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import {
  fetchShipwrightJobs,
  createShipwrightJob,
  fetchShipwrightJobDetails,
  clearJobDetails,
} from './shipwrightJobsSlice';
import type { ShipwrightJobResponse, ShipwrightJobDetailsResponse } from '@core/gen/shipwright/api/shipwright_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ShipwrightJobRequest, ShipwrightJobListRequest } from '@core/gen/shipwright/api/shipwright_pb';
import { addNotification } from '@core/services/notifications';

export interface UseShipwrightJobsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: PartialMessage<ShipwrightJobListRequest>;
}

export interface UseShipwrightJobsReturn {
  jobs: ShipwrightJobResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createJob: (data: PartialMessage<ShipwrightJobRequest>) => Promise<boolean>;
  selectedJobDetails: ShipwrightJobDetailsResponse | null;
  detailsJobId: string | null;
  detailsLoading: boolean;
  detailsError: string | null;
  loadJobDetails: (jobId: string) => Promise<void>;
  clearDetails: () => void;
}

export function useShipwrightJobs(options: UseShipwrightJobsOptions = {}): UseShipwrightJobsReturn {
  const { autoRefresh = true, refreshInterval = 5000, filters } = options;
  const dispatch = useAppDispatch();
  const { items: jobs, loading, error, selectedJobDetails, detailsJobId, detailsLoading, detailsError } = useAppSelector(
    (state) => state.shipwrightJobs
  );

  useEffect(() => {
    dispatch(fetchShipwrightJobs(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchShipwrightJobs(filters));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dispatch, filters]);

  const refresh = useCallback(async () => {
    await dispatch(fetchShipwrightJobs(filters));
  }, [dispatch, filters]);

  const createJob = useCallback(
    async (data: PartialMessage<ShipwrightJobRequest>): Promise<boolean> => {
      try {
        await dispatch(createShipwrightJob(data)).unwrap();
        addNotification('success', `Shipwright job created for ${data.hostname}`);
        dispatch(fetchShipwrightJobs(filters));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addNotification('error', `Failed to create job: ${message}`);
        return false;
      }
    },
    [dispatch, filters]
  );

  const loadJobDetails = useCallback(
    async (jobId: string) => {
      await dispatch(fetchShipwrightJobDetails(jobId));
    },
    [dispatch]
  );

  const clearDetails = useCallback(() => {
    dispatch(clearJobDetails());
  }, [dispatch]);

  return {
    jobs: jobs as ShipwrightJobResponse[],
    loading,
    error,
    refresh,
    createJob,
    selectedJobDetails: selectedJobDetails as ShipwrightJobDetailsResponse | null,
    detailsJobId,
    detailsLoading,
    detailsError,
    loadJobDetails,
    clearDetails,
  };
}
