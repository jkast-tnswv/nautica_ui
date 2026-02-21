import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockDispatch = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
vi.mock('@core/store/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useAppSelector: vi.fn((selector: any) => selector(mockState)),
}));

vi.mock('@core/services/notifications', () => ({
  addNotification: vi.fn(),
}));

vi.mock('../slices/shipwrightJobsSlice', () => ({
  fetchShipwrightJobs: vi.fn((arg: any) => ({ type: 'fetch', payload: arg })),
  createShipwrightJob: vi.fn((arg: any) => ({ type: 'create', payload: arg })),
  fetchShipwrightJobDetails: vi.fn((arg: any) => ({ type: 'details', payload: arg })),
  clearJobDetails: vi.fn(() => ({ type: 'clear' })),
}));

const mockState = {
  shipwrightJobs: {
    items: [{ jobId: 'j1', hostname: 'h1' }],
    loading: false,
    error: null,
    selectedJobDetails: null,
    detailsJobId: null,
    detailsLoading: false,
    detailsError: null,
  },
};

import { useShipwrightJobs } from './useShipwrightJobs';
import {
  fetchShipwrightJobs,
  createShipwrightJob,
  fetchShipwrightJobDetails,
  clearJobDetails,
} from '../slices/shipwrightJobsSlice';
import { addNotification } from '@core/services/notifications';

describe('useShipwrightJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns jobs from store', () => {
    const { result } = renderHook(() => useShipwrightJobs());
    expect(result.current.jobs).toEqual([{ jobId: 'j1', hostname: 'h1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedJobDetails).toBeNull();
    expect(result.current.detailsJobId).toBeNull();
    expect(result.current.detailsLoading).toBe(false);
    expect(result.current.detailsError).toBeNull();
  });

  it('dispatches fetchShipwrightJobs on mount', () => {
    renderHook(() => useShipwrightJobs());
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
  });

  it('createJob dispatches and refreshes on success', async () => {
    const { result } = renderHook(() => useShipwrightJobs());
    mockDispatch.mockClear();
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.createJob({ hostname: 'h2' });
    });
    expect(success).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'create', payload: { hostname: 'h2' } }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
    expect(addNotification).toHaveBeenCalledWith('success', expect.stringContaining('h2'));
  });

  it('createJob returns false on error', async () => {
    const { result } = renderHook(() => useShipwrightJobs());
    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject(new Error('fail')),
    }));
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.createJob({ hostname: 'h2' });
    });
    expect(success).toBe(false);
    expect(addNotification).toHaveBeenCalledWith('error', expect.stringContaining('fail'));
  });

  it('loadJobDetails dispatches fetchShipwrightJobDetails', async () => {
    const { result } = renderHook(() => useShipwrightJobs());
    mockDispatch.mockClear();
    await act(async () => {
      await result.current.loadJobDetails('j1');
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'details', payload: 'j1' }),
    );
  });

  it('clearDetails dispatches clearJobDetails', () => {
    const { result } = renderHook(() => useShipwrightJobs());
    mockDispatch.mockClear();
    act(() => {
      result.current.clearDetails();
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'clear' }),
    );
  });
});
