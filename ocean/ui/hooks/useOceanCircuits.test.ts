import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockReturn = {
  data: [{ id: 'c1' }],
  loading: false,
  error: null,
  refresh: vi.fn(),
};
vi.mock('@core/hooks/useEntityData', () => ({
  useEntityData: vi.fn(() => mockReturn),
}));

vi.mock('../slices/oceanCircuitsSlice', () => ({
  fetchOceanCircuits: vi.fn(),
}));

import { useOceanCircuits } from './useOceanCircuits';
import { useEntityData } from '@core/hooks/useEntityData';
import { fetchOceanCircuits } from '../slices/oceanCircuitsSlice';

describe('useOceanCircuits', () => {
  it('returns circuits (renamed from data)', () => {
    const { result } = renderHook(() => useOceanCircuits());
    expect(result.current.circuits).toEqual([{ id: 'c1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refresh).toBe(mockReturn.refresh);
  });

  it('passes fetchThunk and selector to useEntityData', () => {
    renderHook(() => useOceanCircuits());
    expect(useEntityData).toHaveBeenCalledWith(
      fetchOceanCircuits,
      expect.any(Function),
      expect.any(Object),
    );
  });
});
