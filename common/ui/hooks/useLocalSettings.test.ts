import { renderHook, act } from '@testing-library/react';
import {
  useLocalSettings,
  getDefaultPageSize,
  getTablePageSize,
  setTablePageSize,
  clearTablePageSizeOverrides,
  getLocalApiUrl,
  setLocalApiUrl,
} from './useLocalSettings';

const SETTINGS_KEY = 'fc_local_settings';
const TABLE_KEY = 'fc_table_page_sizes';

const DEFAULTS = { apiUrl: '/api', theme: 'dark', defaultPageSize: 25 };

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalSettings', () => {
  it('returns defaults when nothing stored', () => {
    const { result } = renderHook(() => useLocalSettings());
    expect(result.current.settings).toEqual(DEFAULTS);
  });

  it('reads from localStorage', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ apiUrl: 'http://localhost:9000', theme: 'light', defaultPageSize: 50 }),
    );
    const { result } = renderHook(() => useLocalSettings());
    expect(result.current.settings).toEqual({
      apiUrl: 'http://localhost:9000',
      theme: 'light',
      defaultPageSize: 50,
    });
  });

  it('updateSettings merges partial updates and persists', () => {
    const { result } = renderHook(() => useLocalSettings());
    act(() => result.current.updateSettings({ theme: 'light' }));
    expect(result.current.settings).toEqual({ ...DEFAULTS, theme: 'light' });
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual({
      ...DEFAULTS,
      theme: 'light',
    });
  });

  it('resetSettings restores defaults', () => {
    const { result } = renderHook(() => useLocalSettings());
    act(() => result.current.updateSettings({ theme: 'light', defaultPageSize: 100 }));
    act(() => result.current.resetSettings());
    expect(result.current.settings).toEqual(DEFAULTS);
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual(DEFAULTS);
  });
});

describe('getDefaultPageSize', () => {
  it('returns stored page size', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ defaultPageSize: 50 }));
    expect(getDefaultPageSize()).toBe(50);
  });

  it('returns default when nothing stored', () => {
    expect(getDefaultPageSize()).toBe(25);
  });
});

describe('getTablePageSize', () => {
  it('returns null when no override', () => {
    expect(getTablePageSize('devices')).toBeNull();
  });
});

describe('setTablePageSize', () => {
  it('stores override', () => {
    setTablePageSize('devices', 50);
    expect(getTablePageSize('devices')).toBe(50);
    expect(JSON.parse(localStorage.getItem(TABLE_KEY)!)).toEqual({ devices: 50 });
  });

  it('removes override when matching default', () => {
    setTablePageSize('devices', 50);
    expect(getTablePageSize('devices')).toBe(50);
    // Default page size is 25
    setTablePageSize('devices', 25);
    expect(getTablePageSize('devices')).toBeNull();
  });
});

describe('clearTablePageSizeOverrides', () => {
  it('removes all overrides', () => {
    setTablePageSize('devices', 50);
    setTablePageSize('jobs', 100);
    clearTablePageSizeOverrides();
    expect(localStorage.getItem(TABLE_KEY)).toBeNull();
    expect(getTablePageSize('devices')).toBeNull();
    expect(getTablePageSize('jobs')).toBeNull();
  });
});

describe('getLocalApiUrl', () => {
  it('returns stored URL', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ apiUrl: 'http://custom:8080' }));
    expect(getLocalApiUrl()).toBe('http://custom:8080');
  });

  it('returns default when nothing stored', () => {
    expect(getLocalApiUrl()).toBe('/api');
  });
});

describe('setLocalApiUrl', () => {
  it('updates URL in storage', () => {
    setLocalApiUrl('http://new-api:3000');
    expect(getLocalApiUrl()).toBe('http://new-api:3000');
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(stored.apiUrl).toBe('http://new-api:3000');
  });
});
