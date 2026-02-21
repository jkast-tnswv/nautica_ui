import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('reads stored value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('stored'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    expect(result.current[0]).toBe('stored');
  });

  it('writes value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('testKey')!)).toBe('updated');
  });

  it('supports updater function pattern', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(JSON.parse(localStorage.getItem('testKey')!)).toBe(15);
  });

  it('returns initial value for invalid JSON', () => {
    localStorage.setItem('testKey', 'not-valid-json');

    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('handles storage event from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'testKey',
          newValue: JSON.stringify('from-other-tab'),
        })
      );
    });

    expect(result.current[0]).toBe('from-other-tab');
  });
});
