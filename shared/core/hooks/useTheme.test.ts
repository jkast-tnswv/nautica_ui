import { renderHook, act } from '@testing-library/react';
import { useTheme, useWebTheme, THEME_OPTIONS } from './useTheme';

describe('THEME_OPTIONS', () => {
  it('has expected theme entries', () => {
    const values = THEME_OPTIONS.map(t => t.value);
    expect(values).toContain('dark');
    expect(values).toContain('light');
    expect(values).toContain('plain');
    expect(values).toContain('solarized');
    expect(values).toContain('evergreen-dark');
    expect(values).toContain('evergreen-light');
    expect(values).toContain('ocean-dark');
    expect(values).toContain('ocean-light');
    expect(values).toContain('nautical-dark');
    expect(values).toContain('nautical-light');
    expect(values).toContain('contrast-dark');
    expect(values).toContain('contrast-light');
  });

  it('each entry has value, icon, label, and description', () => {
    for (const option of THEME_OPTIONS) {
      expect(option.value).toBeTruthy();
      expect(option.icon).toBeTruthy();
      expect(option.label).toBeTruthy();
      expect(option.description).toBeTruthy();
    }
  });
});

describe('useTheme', () => {
  const createMockStorage = (initial: Record<string, string> = {}) => {
    const store: Record<string, string> = { ...initial };
    return {
      get: vi.fn((key: string) => store[key] ?? null),
      set: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
    };
  };

  it('returns dark theme by default', () => {
    const storage = createMockStorage();
    const { result } = renderHook(() => useTheme({ storage }));

    expect(result.current.theme).toBe('dark');
  });

  it('reads stored theme from storage', () => {
    const storage = createMockStorage({ 'ztp-theme': 'light' });
    const { result } = renderHook(() => useTheme({ storage }));

    expect(result.current.theme).toBe('light');
    expect(storage.get).toHaveBeenCalledWith('ztp-theme');
  });

  it('ignores invalid stored theme and falls back to default', () => {
    const storage = createMockStorage({ 'ztp-theme': 'nonexistent-theme' });
    const { result } = renderHook(() => useTheme({ storage }));

    expect(result.current.theme).toBe('dark');
  });

  it('setTheme updates theme and writes to storage', () => {
    const storage = createMockStorage();
    const { result } = renderHook(() => useTheme({ storage }));

    act(() => {
      result.current.setTheme('ocean-dark');
    });

    expect(result.current.theme).toBe('ocean-dark');
    expect(storage.set).toHaveBeenCalledWith('ztp-theme', 'ocean-dark');
  });

  it('setTheme calls onThemeChange callback', () => {
    const storage = createMockStorage();
    const onThemeChange = vi.fn();
    const { result } = renderHook(() => useTheme({ storage, onThemeChange }));

    act(() => {
      result.current.setTheme('light');
    });

    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  it('themeConfig matches current theme', () => {
    const storage = createMockStorage({ 'ztp-theme': 'solarized' });
    const { result } = renderHook(() => useTheme({ storage }));

    expect(result.current.themeConfig.value).toBe('solarized');
    expect(result.current.themeConfig.label).toBe('Cyan Monochrome');
  });

  it('themeOptions returns THEME_OPTIONS', () => {
    const storage = createMockStorage();
    const { result } = renderHook(() => useTheme({ storage }));

    expect(result.current.themeOptions).toBe(THEME_OPTIONS);
  });
});

describe('useWebTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme attribute on document.documentElement', () => {
    const storage = {
      get: vi.fn(() => null),
      set: vi.fn(),
    };

    renderHook(() => useWebTheme({ storage }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates data-theme when theme changes', () => {
    const storage = {
      get: vi.fn(() => null),
      set: vi.fn(),
    };

    const { result } = renderHook(() => useWebTheme({ storage }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
