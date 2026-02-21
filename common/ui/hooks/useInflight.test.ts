import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockCount = 0;
let changeListener: ((count: number) => void) | null = null;

vi.mock('../services/base', () => ({
  getInflightCount: vi.fn(() => mockCount),
  onInflightChange: vi.fn((listener: (count: number) => void) => {
    changeListener = listener;
    return vi.fn(() => { changeListener = null; });
  }),
}));

import { onInflightChange } from '../services/base';
import { useInflight } from './useInflight';

beforeEach(() => {
  vi.useFakeTimers();
  mockCount = 0;
  changeListener = null;
  vi.clearAllMocks();
  // Restore the listener-capturing implementation after clearAllMocks
  vi.mocked(onInflightChange).mockImplementation((listener: (count: number) => void) => {
    changeListener = listener;
    return vi.fn(() => { changeListener = null; });
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useInflight', () => {
  it('returns 0 initially when no requests are inflight', () => {
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

  it('shows count immediately when requests go inflight', () => {
    const { result } = renderHook(() => useInflight());
    expect(result.current).toBe(0);

    act(() => { changeListener!(3); });
    expect(result.current).toBe(3);
  });

  it('updates display count as inflight count changes', () => {
    const { result } = renderHook(() => useInflight());

    act(() => { changeListener!(1); });
    expect(result.current).toBe(1);

    act(() => { changeListener!(5); });
    expect(result.current).toBe(5);

    act(() => { changeListener!(2); });
    expect(result.current).toBe(2);
  });

  it('lingers at last positive count for at least 600ms before showing 0', () => {
    const { result } = renderHook(() => useInflight());

    // Go inflight
    act(() => { changeListener!(2); });
    expect(result.current).toBe(2);

    // Drop to 0 — should NOT immediately show 0
    act(() => { changeListener!(0); });
    expect(result.current).toBe(2);

    // Still showing after 500ms
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe(2);

    // After 600ms total, should clear to 0
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe(0);
  });

  it('cancels linger timer if new request arrives before timeout', () => {
    const { result } = renderHook(() => useInflight());

    act(() => { changeListener!(1); });
    act(() => { changeListener!(0); });
    // Lingering at 1...
    expect(result.current).toBe(1);

    // New request comes in before linger timeout
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { changeListener!(2); });
    expect(result.current).toBe(2);

    // Even after the original timer would have fired, we're still showing 2
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current).toBe(2);
  });

  it('accounts for elapsed time when computing linger delay', () => {
    const { result } = renderHook(() => useInflight());

    // Go inflight, wait 400ms, then drop to 0
    act(() => { changeListener!(1); });
    act(() => { vi.advanceTimersByTime(400); });
    act(() => { changeListener!(0); });

    // Only 200ms remaining (600 - 400)
    expect(result.current).toBe(1);

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(0);
  });

  it('clears to 0 immediately if inflight lasted longer than 600ms', () => {
    const { result } = renderHook(() => useInflight());

    act(() => { changeListener!(1); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { changeListener!(0); });

    // Already past 600ms, so the remaining delay is 0
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current).toBe(0);
  });

  it('cleans up pending timers on unmount', () => {
    const { result, unmount } = renderHook(() => useInflight());

    act(() => { changeListener!(1); });
    act(() => { changeListener!(0); });
    // Lingering...
    expect(result.current).toBe(1);

    unmount();

    // Timer should have been cleaned up, no errors
    act(() => { vi.advanceTimersByTime(1000); });
  });
});
