import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockReturn = {
  data: [{ id: 'd1' }],
  loading: false,
  error: null,
  refresh: vi.fn(),
};
vi.mock('@core/hooks/useEntityData', () => ({
  useEntityData: vi.fn(() => mockReturn),
}));

vi.mock('../slices/oceanDevicesSlice', () => ({
  fetchOceanDevices: vi.fn(),
}));

import { useOceanDevices } from './useOceanDevices';
import { useEntityData } from '@core/hooks/useEntityData';
import { fetchOceanDevices } from '../slices/oceanDevicesSlice';

describe('useOceanDevices', () => {
  it('returns devices (renamed from data)', () => {
    const { result } = renderHook(() => useOceanDevices());
    expect(result.current.devices).toEqual([{ id: 'd1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refresh).toBe(mockReturn.refresh);
  });

  it('passes fetchThunk and selector to useEntityData', () => {
    renderHook(() => useOceanDevices());
    expect(useEntityData).toHaveBeenCalledWith(
      fetchOceanDevices,
      expect.any(Function),
      expect.any(Object),
    );
  });

  it('passes options through', () => {
    const options = { autoRefresh: false, refreshInterval: 3000 };
    renderHook(() => useOceanDevices(options));
    expect(useEntityData).toHaveBeenCalledWith(
      fetchOceanDevices,
      expect.any(Function),
      options,
    );
  });
});
