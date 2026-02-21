import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../services/base', () => ({
  getInflightCount: vi.fn(() => 0),
  onInflightChange: vi.fn(() => vi.fn()),
}));

import { getInflightCount, onInflightChange } from '../services/base';
import { useInflight } from './useInflight';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useInflight', () => {
  it('returns 0 initially', () => {
    const { result } = renderHook(() => useInflight());
    expect(result.current).toBe(0);
  });

  it('subscribes to inflight changes on mount', () => {
    renderHook(() => useInflight());
    expect(onInflightChange).toHaveBeenCalledTimes(1);
    expect(onInflightChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onInflightChange).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useInflight());
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
