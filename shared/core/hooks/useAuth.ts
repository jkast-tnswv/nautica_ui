import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { getOktaAuth, isOktaCallback, isOktaConfigured } from '../services/okta';
import type { IDToken } from '@okta/okta-auth-js';

export interface AuthUser {
  name: string | null;
  email: string | null;
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<UseAuthReturn | null>(null);

export const AuthProvider = AuthContext.Provider;

function extractUser(idToken: IDToken): AuthUser {
  const claims = idToken.claims;
  return {
    name: (claims.name as string) || null,
    email: (claims.email as string) || null,
  };
}

export function useAuthState(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      // Skip auth when Okta isn't configured — treat as authenticated
      if (!isOktaConfigured()) {
        if (!cancelled) {
          setIsAuthenticated(true);
          setUser({ name: 'Dev User', email: 'dev@localhost' });
          setLoading(false);
        }
        return;
      }

      const oktaAuth = getOktaAuth();

      try {
        // Handle redirect callback from Okta
        if (isOktaCallback()) {
          const tokenResponse = await oktaAuth.token.parseFromUrl();
          oktaAuth.tokenManager.setTokens(tokenResponse.tokens);
          window.history.replaceState({}, '', '/');
        }

        // Check for existing valid tokens
        const accessToken = await oktaAuth.tokenManager.get('accessToken');
        const idToken = await oktaAuth.tokenManager.get('idToken');

        if (!cancelled && accessToken && idToken) {
          setIsAuthenticated(true);
          setUser(extractUser(idToken as IDToken));
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();

    // Listen for token lifecycle events (only when Okta is configured)
    if (!isOktaConfigured()) {
      return () => { cancelled = true; };
    }

    const oktaAuth = getOktaAuth();

    const handleRenewed = (key: string, newToken: unknown) => {
      if (key === 'idToken' && newToken) {
        setUser(extractUser(newToken as IDToken));
      }
    };

    const handleExpired = (key: string) => {
      if (key === 'accessToken') {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    oktaAuth.tokenManager.on('renewed', handleRenewed);
    oktaAuth.tokenManager.on('expired', handleExpired);

    return () => {
      cancelled = true;
      oktaAuth.tokenManager.off('renewed', handleRenewed);
      oktaAuth.tokenManager.off('expired', handleExpired);
    };
  }, []);

  const login = useCallback(async () => {
    if (!isOktaConfigured()) return;
    const oktaAuth = getOktaAuth();
    await oktaAuth.token.getWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    if (!isOktaConfigured()) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    const oktaAuth = getOktaAuth();
    oktaAuth.tokenManager.clear();
    setIsAuthenticated(false);
    setUser(null);
    await oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin });
  }, []);

  return { isAuthenticated, user, login, logout, loading };
}

export function useAuth(): UseAuthReturn {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
