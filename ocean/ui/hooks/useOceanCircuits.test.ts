import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useOceanCircuits } from './useOceanCircuits';
import oceanCircuitsReducer from '../slices/oceanCircuitsSlice';

function createTestStore(preloadedItems: any[] = [], loading = false, error: string | null = null) {
  return configureStore({
    reducer: { oceanCircuits: oceanCircuitsReducer },
    preloadedState: {
      oceanCircuits: { items: preloadedItems, loading, error },
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

describe('useOceanCircuits', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns circuits from store (renamed from data)', () => {
    const circuits = [
      { circuitId: 'c1', aInterface: 'Eth1/1', zInterface: 'Eth1/2' },
      { circuitId: 'c2', aInterface: 'Eth2/1', zInterface: 'Eth2/2' },
    ];
    const store = createTestStore(circuits);
    const { result } = renderHook(() => useOceanCircuits({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.circuits).toEqual(circuits);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns loading state from store', () => {
    const store = createTestStore([], true);
    const { result } = renderHook(() => useOceanCircuits({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.circuits).toEqual([]);
  });

  it('returns error state from store', () => {
    const store = createTestStore([], false, 'Connection refused');
    const { result } = renderHook(() => useOceanCircuits({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.error).toBe('Connection refused');
  });

  it('dispatches fetch thunk on mount', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderHook(() => useOceanCircuits({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const action = dispatchSpy.mock.calls[0][0];
    expect(typeof action).toBe('function'); // async thunk dispatched
  });

  it('provides a refresh function that dispatches', async () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useOceanCircuits({ autoRefresh: false }), {
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

    renderHook(() => useOceanCircuits({ autoRefresh: false }), {
      wrapper: createWrapper(store),
    });

    const callsBefore = dispatchSpy.mock.calls.length;
    vi.advanceTimersByTime(30000);
    expect(dispatchSpy.mock.calls.length).toBe(callsBefore);
  });
});
