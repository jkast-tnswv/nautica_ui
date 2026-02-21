import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../services/okta', () => ({
  isOktaConfigured: vi.fn(() => false),
  getOktaAuth: vi.fn(),
  isOktaCallback: vi.fn(() => false),
}));

import { isOktaConfigured } from '../services/okta';
import { useAuthState, useAuth, AuthProvider } from './useAuth';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAuthState', () => {
  it('when Okta not configured, sets isAuthenticated=true with Dev User', async () => {
    vi.mocked(isOktaConfigured).mockReturnValue(false);

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ name: 'Dev User', email: 'dev@localhost' });
  });

  it('loading starts true and becomes false', async () => {
    vi.mocked(isOktaConfigured).mockReturnValue(false);

    // Track all loading values observed across renders
    const loadingValues: boolean[] = [];
    const { result } = renderHook(() => {
      const state = useAuthState();
      loadingValues.push(state.loading);
      return state;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The initial state is loading=true; it then transitions to false
    expect(loadingValues[0]).toBe(true);
    expect(loadingValues[loadingValues.length - 1]).toBe(false);
  });

  it('logout when Okta not configured sets isAuthenticated=false', async () => {
    vi.mocked(isOktaConfigured).mockReturnValue(false);

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

describe('useAuth', () => {
  it('throws when used without AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('returns context value when inside AuthProvider', () => {
    const mockAuthValue = {
      isAuthenticated: true,
      user: { name: 'Test', email: 'test@test.com' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, { value: mockAuthValue }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ name: 'Test', email: 'test@test.com' });
    expect(result.current.loading).toBe(false);
  });
});
