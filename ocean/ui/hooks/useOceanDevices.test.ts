import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useOceanDevices } from './useOceanDevices';
import oceanDevicesReducer from '../slices/oceanDevicesSlice';

function createTestStore(preloadedItems: any[] = [], loading = false, error: string | null = null) {
  return configureStore({
    reducer: { oceanDevices: oceanDevicesReducer },
    preloadedState: {
      oceanDevices: { items: preloadedItems, loading, error },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
  });
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  };
}

describe('useOceanDevices', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns devices from store (renamed from data)', () => {
    const devices = [
      { deviceId: 'd1', hostname: 'sw-01' },
      { deviceId: 'd2', hostname: 'rtr-01' },
    ];
    const store = createTestStore(devices);
    const { result } = renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.devices).toEqual(devices);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns loading state from store', () => {
    const store = createTestStore([], true);
    const { result } = renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.devices).toEqual([]);
  });

  it('returns error state from store', () => {
    const store = createTestStore([], false, 'Network error');
    const { result } = renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.error).toBe('Network error');
  });

  it('dispatches fetch thunk on mount', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const action = dispatchSpy.mock.calls[0][0];
    expect(typeof action).toBe('function'); // async thunk dispatched
  });

  it('provides a refresh function that dispatches', async () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    const initialCalls = dispatchSpy.mock.calls.length;

    await act(async () => {
      await result.current.refresh();
    });

    expect(dispatchSpy.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('does not set up interval when autoRefresh is false', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderHook(() => useOceanDevices({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    const callsBefore = dispatchSpy.mock.calls.length;
    vi.advanceTimersByTime(30000);
    expect(dispatchSpy.mock.calls.length).toBe(callsBefore);
  });

  it('sets up auto-refresh interval when enabled', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderHook(() => useOceanDevices({ autoRefresh: true, refreshInterval: 5000 }), {
      wrapper: createWrapper(store),
    });

    const initialCalls = dispatchSpy.mock.calls.length;
    vi.advanceTimersByTime(5000);
    expect(dispatchSpy.mock.calls.length).toBe(initialCalls + 1);
  });
});
