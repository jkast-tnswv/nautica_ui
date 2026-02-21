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

vi.mock('../slices/ledgerSlice', () => ({
  searchLedger: vi.fn((arg: any) => ({ type: 'search', payload: arg })),
  clearResults: vi.fn(() => ({ type: 'clear' })),
}));

const mockState = {
  ledger: {
    items: [],
    loading: false,
    error: null,
    query: '',
  },
};

import { useLedger } from './useLedger';
import { searchLedger, clearResults } from '../slices/ledgerSlice';

describe('useLedger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns records from store', () => {
    const { result } = renderHook(() => useLedger());
    expect(result.current.records).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('search dispatches searchLedger with trimmed query', async () => {
    const { result } = renderHook(() => useLedger());
    mockDispatch.mockClear();
    await act(async () => {
      await result.current.search('  example.com  ');
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'search', payload: 'example.com' }),
    );
  });

  it('search does nothing for empty/whitespace query', async () => {
    const { result } = renderHook(() => useLedger());
    mockDispatch.mockClear();
    await act(async () => {
      await result.current.search('   ');
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.search('');
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('clear dispatches clearResults', () => {
    const { result } = renderHook(() => useLedger());
    mockDispatch.mockClear();
    act(() => {
      result.current.clear();
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'clear' }),
    );
  });
});
