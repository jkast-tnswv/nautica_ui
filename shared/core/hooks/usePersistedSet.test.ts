import { renderHook, act } from '@testing-library/react';
import { usePersistedSet } from './usePersistedSet';

describe('usePersistedSet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty set when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedSet('testKey'));

    expect(result.current[0].size).toBe(0);
  });

  it('loads stored set from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify(['a', 'b', 3]));

    const { result } = renderHook(() => usePersistedSet('testKey'));

    expect(result.current[0]).toEqual(new Set(['a', 'b', 3]));
  });

  it('saves set to localStorage on update', () => {
    const { result } = renderHook(() => usePersistedSet('testKey'));

    act(() => {
      result.current[1](new Set(['x', 'y']));
    });

    expect(result.current[0]).toEqual(new Set(['x', 'y']));
    const stored = JSON.parse(localStorage.getItem('testKey')!);
    expect(stored).toEqual(['x', 'y']);
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('testKey', 'not-valid-json');

    const { result } = renderHook(() => usePersistedSet('testKey'));

    expect(result.current[0].size).toBe(0);
  });
});
