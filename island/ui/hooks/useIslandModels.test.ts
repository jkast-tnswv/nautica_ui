import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockReturn = {
  data: [{ id: 'a1' }],
  loading: false,
  error: null,
  refresh: vi.fn(),
};
vi.mock('@core/hooks/useEntityData', () => ({
  useEntityData: vi.fn(() => mockReturn),
}));

vi.mock('../slices/islandModelsSlice', () => ({
  fetchIslandAssignments: vi.fn(),
}));

import { useIslandAssignments } from './useIslandModels';
import { useEntityData } from '@core/hooks/useEntityData';
import { fetchIslandAssignments } from '../slices/islandModelsSlice';

describe('useIslandAssignments', () => {
  it('returns assignments from useEntityData', () => {
    const { result } = renderHook(() => useIslandAssignments());
    expect(result.current.assignments).toEqual([{ id: 'a1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refresh).toBe(mockReturn.refresh);
    expect(useEntityData).toHaveBeenCalledWith(
      fetchIslandAssignments,
      expect.any(Function),
    );
  });
});
