import { renderHook, act } from '@testing-library/react';
import { useModalRoute } from './useModalRoute';

beforeEach(() => {
  // Clear hash before each test
  window.location.hash = '';
});

describe('useModalRoute', () => {
  it('returns null modal when no hash', () => {
    const { result } = renderHook(() => useModalRoute());
    expect(result.current.modal).toBeNull();
    expect(result.current.params).toEqual({});
  });

  it('openModal sets window.location.hash', () => {
    const { result } = renderHook(() => useModalRoute());
    act(() => result.current.openModal('edit', { id: '42' }));
    expect(window.location.hash).toBe('#modal=edit&id=42');
  });

  it('closeModal uses replaceState to clear hash', () => {
    const replaceStateSpy = vi.spyOn(history, 'replaceState');
    const { result } = renderHook(() => useModalRoute());
    act(() => result.current.openModal('edit'));
    act(() => result.current.closeModal());
    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      '',
      window.location.pathname + window.location.search,
    );
    expect(result.current.modal).toBeNull();
    replaceStateSpy.mockRestore();
  });

  it('isModal returns true for matching modal name', () => {
    window.location.hash = '#modal=confirm';
    const { result } = renderHook(() => useModalRoute());
    expect(result.current.isModal('confirm')).toBe(true);
    expect(result.current.isModal('edit')).toBe(false);
  });

  it('getParam returns param value', () => {
    window.location.hash = '#modal=edit&id=99&tab=details';
    const { result } = renderHook(() => useModalRoute());
    expect(result.current.getParam('id')).toBe('99');
    expect(result.current.getParam('tab')).toBe('details');
    expect(result.current.getParam('missing')).toBeUndefined();
  });

  it('responds to hashchange events', () => {
    const { result } = renderHook(() => useModalRoute());
    expect(result.current.modal).toBeNull();

    act(() => {
      window.location.hash = '#modal=create&type=device';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.modal).toBe('create');
    expect(result.current.params).toEqual({ type: 'device' });
  });
});
