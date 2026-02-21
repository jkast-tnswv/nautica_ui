import { renderHook, act } from '@testing-library/react';
import { useAsyncModal, useSimpleModal } from './useAsyncModal';

describe('useAsyncModal', () => {
  it('starts closed with null item', () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    expect(result.current.item).toBeNull();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('open sets item and isOpen', () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    act(() => result.current.open('test-item'));
    expect(result.current.item).toBe('test-item');
    expect(result.current.isOpen).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('close resets all state', () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    act(() => result.current.open('test-item'));
    act(() => result.current.close());
    expect(result.current.item).toBeNull();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('execute sets loading then result on success', async () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    act(() => result.current.open('device-1'));

    let resolveOp: (value: string) => void;
    const operation = new Promise<string>(resolve => {
      resolveOp = resolve;
    });

    let executePromise: Promise<string | null>;
    act(() => {
      executePromise = result.current.execute(() => operation);
    });

    // Loading should be true while executing
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveOp!('connected');
      await executePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBe('connected');
    expect(result.current.error).toBeNull();
  });

  it('execute sets error on failure', async () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    act(() => result.current.open('device-1'));

    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('Connection refused')));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('Connection refused');
  });

  it('reset clears result and error', async () => {
    const { result } = renderHook(() => useAsyncModal<string, string>());
    act(() => result.current.open('device-1'));

    await act(async () => {
      await result.current.execute(() => Promise.resolve('done'));
    });
    expect(result.current.result).toBe('done');

    act(() => result.current.reset());
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    // Item should still be set (modal stays open)
    expect(result.current.item).toBe('device-1');
    expect(result.current.isOpen).toBe(true);
  });

  it('calls onOpen/onClose callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAsyncModal<string, string>({ onOpen, onClose }),
    );

    act(() => result.current.open('item-1'));
    expect(onOpen).toHaveBeenCalledWith('item-1');
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('useSimpleModal', () => {
  it('open/close cycle', () => {
    const { result } = renderHook(() => useSimpleModal<string>());
    expect(result.current.item).toBeNull();
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open('hello'));
    expect(result.current.item).toBe('hello');
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.item).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });
});
