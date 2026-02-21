import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../services/telemetry', () => ({
  getTelemetryEvents: vi.fn(() => []),
  onTelemetryChange: vi.fn(() => vi.fn()),
}));

import { getTelemetryEvents, onTelemetryChange } from '../services/telemetry';
import { useTelemetry } from './useTelemetry';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTelemetry', () => {
  it('returns empty array initially', () => {
    const { result } = renderHook(() => useTelemetry());
    expect(result.current).toEqual([]);
  });

  it('subscribes to changes on mount', () => {
    renderHook(() => useTelemetry());
    expect(onTelemetryChange).toHaveBeenCalledTimes(1);
    expect(onTelemetryChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates when listener fires', () => {
    let capturedListener: ((events: any[]) => void) | null = null;
    vi.mocked(onTelemetryChange).mockImplementation((listener) => {
      capturedListener = listener;
      return vi.fn();
    });

    const { result } = renderHook(() => useTelemetry());
    expect(result.current).toEqual([]);

    const mockEvent = {
      id: 1,
      type: 'page_load' as const,
      timestamp: Date.now(),
      detail: '/home',
      metadata: { url: 'http://localhost/home' },
    };

    act(() => {
      capturedListener!([mockEvent]);
    });

    expect(result.current).toEqual([mockEvent]);
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onTelemetryChange).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useTelemetry());
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
