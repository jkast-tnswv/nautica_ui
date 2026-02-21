import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../services/base', () => ({
  getApiHistory: vi.fn(() => []),
  onApiHistoryChange: vi.fn(() => vi.fn()),
}));

import { getApiHistory, onApiHistoryChange } from '../services/base';
import { useApiHistory } from './useApiHistory';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useApiHistory', () => {
  it('returns empty array initially', () => {
    const { result } = renderHook(() => useApiHistory());
    expect(result.current).toEqual([]);
  });

  it('subscribes to changes on mount', () => {
    renderHook(() => useApiHistory());
    expect(onApiHistoryChange).toHaveBeenCalledTimes(1);
    expect(onApiHistoryChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates when listener fires', () => {
    let capturedListener: ((entries: any[]) => void) | null = null;
    vi.mocked(onApiHistoryChange).mockImplementation((listener) => {
      capturedListener = listener;
      return vi.fn();
    });

    const { result } = renderHook(() => useApiHistory());
    expect(result.current).toEqual([]);

    const mockEntry = {
      id: 1,
      method: 'GET',
      url: '/api/test',
      path: '/test',
      queryParams: {},
      status: 200,
      error: null,
      durationMs: 50,
      timestamp: Date.now(),
      requestBody: null,
      responseBody: { ok: true },
    };

    act(() => {
      capturedListener!([mockEntry]);
    });

    expect(result.current).toEqual([mockEntry]);
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onApiHistoryChange).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useApiHistory());
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
