import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockReturn = {
  data: [{ id: 'fw1' }],
  loading: false,
  error: null,
  refresh: vi.fn(),
};
vi.mock('@core/hooks/useEntityData', () => ({
  useEntityData: vi.fn(() => mockReturn),
}));

vi.mock('../slices/islandFirmwareSlice', () => ({
  fetchIslandFirmware: vi.fn(),
}));

import { useIslandFirmware } from './useIslandFirmware';
import { useEntityData } from '@core/hooks/useEntityData';
import { fetchIslandFirmware } from '../slices/islandFirmwareSlice';

describe('useIslandFirmware', () => {
  it('returns firmware from useEntityData', () => {
    const { result } = renderHook(() => useIslandFirmware());
    expect(result.current.firmware).toEqual([{ id: 'fw1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refresh).toBe(mockReturn.refresh);
    expect(useEntityData).toHaveBeenCalledWith(
      fetchIslandFirmware,
      expect.any(Function),
    );
  });
});
