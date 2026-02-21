import { renderHook, act } from '@testing-library/react';
import { useEntityData } from './useEntityData';

const mockDispatch = vi.fn(() => Promise.resolve());

vi.mock('../store/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useAppSelector: vi.fn((selector: any) => selector({
    test: { items: [{ id: 1, name: 'Test' }], loading: false, error: null }
  })),
}));

const { useAppSelector } = await import('../store/hooks');

const mockFetchThunk = Object.assign(vi.fn((arg: any) => ({ type: 'test/fetch', payload: arg })), {
  pending: 'test/fetch/pending',
  fulfilled: 'test/fetch/fulfilled',
  rejected: 'test/fetch/rejected',
  typePrefix: 'test/fetch',
});

const testSelector = (state: any) => state.test;

describe('useEntityData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve());
  });

  it('dispatches fetchThunk on mount', () => {
    renderHook(() => useEntityData(mockFetchThunk as any, testSelector));

    expect(mockDispatch).toHaveBeenCalledWith(mockFetchThunk(undefined));
  });

  it('returns data from selector', () => {
    const { result } = renderHook(() => useEntityData(mockFetchThunk as any, testSelector));

    expect(result.current.data).toEqual([{ id: 1, name: 'Test' }]);
  });

  it('returns loading state', () => {
    vi.mocked(useAppSelector).mockImplementation((selector: any) => selector({
      test: { items: [], loading: true, error: null }
    }));

    const { result } = renderHook(() => useEntityData(mockFetchThunk as any, testSelector));

    expect(result.current.loading).toBe(true);
  });

  it('returns error state', () => {
    vi.mocked(useAppSelector).mockImplementation((selector: any) => selector({
      test: { items: [], loading: false, error: 'Something went wrong' }
    }));

    const { result } = renderHook(() => useEntityData(mockFetchThunk as any, testSelector));

    expect(result.current.error).toBe('Something went wrong');
  });

  it('refresh dispatches fetchThunk', async () => {
    const { result } = renderHook(() => useEntityData(mockFetchThunk as any, testSelector));

    mockDispatch.mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockDispatch).toHaveBeenCalledWith(mockFetchThunk(undefined));
  });

  it('sets up auto-refresh interval', () => {
    vi.useFakeTimers();

    renderHook(() =>
      useEntityData(mockFetchThunk as any, testSelector, { refreshInterval: 5000 }),
    );

    const initialCallCount = mockDispatch.mock.calls.length;

    vi.advanceTimersByTime(5000);
    expect(mockDispatch.mock.calls.length).toBe(initialCallCount + 1);

    vi.advanceTimersByTime(5000);
    expect(mockDispatch.mock.calls.length).toBe(initialCallCount + 2);

    vi.useRealTimers();
  });

  it('does not set up interval when autoRefresh is false', () => {
    vi.useFakeTimers();

    renderHook(() =>
      useEntityData(mockFetchThunk as any, testSelector, { autoRefresh: false }),
    );

    const initialCallCount = mockDispatch.mock.calls.length;

    vi.advanceTimersByTime(30000);
    expect(mockDispatch.mock.calls.length).toBe(initialCallCount);

    vi.useRealTimers();
  });

  it('cleans up interval on unmount', () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() =>
      useEntityData(mockFetchThunk as any, testSelector, { refreshInterval: 5000 }),
    );

    const callCountBeforeUnmount = mockDispatch.mock.calls.length;

    unmount();

    vi.advanceTimersByTime(15000);
    expect(mockDispatch.mock.calls.length).toBe(callCountBeforeUnmount);

    vi.useRealTimers();
  });
});
