import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockDispatch = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
vi.mock('@core/store/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useAppSelector: vi.fn((selector: any) => selector(mockState)),
}));

vi.mock('@core/services/notifications', () => ({
  addNotification: vi.fn(),
}));

vi.mock('../slices/harborJobsSlice', () => ({
  fetchHarborJobs: vi.fn((arg: any) => ({ type: 'fetch', payload: arg })),
  createHarborEmbark: vi.fn((arg: any) => ({ type: 'embark', payload: arg })),
  createHarborDisembark: vi.fn((arg: any) => ({ type: 'disembark', payload: arg })),
}));

const mockState = {
  harborJobs: {
    items: [{ jobId: 'j1', hostname: 'host1' }],
    loading: false,
    error: null,
  },
};

import { useHarborJobs } from './useHarborJobs';
import { fetchHarborJobs, createHarborEmbark, createHarborDisembark } from '../slices/harborJobsSlice';
import { addNotification } from '@core/services/notifications';

describe('useHarborJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns jobs from store', () => {
    const { result } = renderHook(() => useHarborJobs());
    expect(result.current.jobs).toEqual([{ jobId: 'j1', hostname: 'host1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('dispatches fetchHarborJobs on mount', () => {
    renderHook(() => useHarborJobs());
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
  });

  it('refresh dispatches fetchHarborJobs', async () => {
    const { result } = renderHook(() => useHarborJobs());
    mockDispatch.mockClear();
    await act(async () => {
      await result.current.refresh();
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
  });

  it('embark dispatches createHarborEmbark and refreshes', async () => {
    const { result } = renderHook(() => useHarborJobs());
    mockDispatch.mockClear();
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.embark({ hostname: 'host2' });
    });
    expect(success).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'embark', payload: { hostname: 'host2' } }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
    expect(addNotification).toHaveBeenCalledWith('success', expect.stringContaining('host2'));
  });

  it('embark returns false on error', async () => {
    const { result } = renderHook(() => useHarborJobs());
    mockDispatch.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject(new Error('fail')),
    }));
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.embark({ hostname: 'host2' });
    });
    expect(success).toBe(false);
    expect(addNotification).toHaveBeenCalledWith('error', expect.stringContaining('fail'));
  });

  it('disembark dispatches createHarborDisembark and refreshes', async () => {
    const { result } = renderHook(() => useHarborJobs());
    mockDispatch.mockClear();
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.disembark({ hostname: 'host3' });
    });
    expect(success).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'disembark', payload: { hostname: 'host3' } }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
    expect(addNotification).toHaveBeenCalledWith('success', expect.stringContaining('host3'));
  });

  it('sets up auto-refresh interval', () => {
    vi.useFakeTimers();
    renderHook(() => useHarborJobs({ autoRefresh: true, refreshInterval: 5000 }));
    mockDispatch.mockClear();
    vi.advanceTimersByTime(5000);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'fetch' }),
    );
    vi.useRealTimers();
  });

  it('does not auto-refresh when disabled', () => {
    vi.useFakeTimers();
    renderHook(() => useHarborJobs({ autoRefresh: false }));
    mockDispatch.mockClear();
    vi.advanceTimersByTime(10000);
    expect(mockDispatch).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
