/**
 * Authentication context for the Eventure frontend.
 *
 * Storage rule: tokens and the cached user object are persisted in
 * `localStorage` under the keys `'token'` and `'user'`. This file is the only
 * place that reads or writes those keys directly. Components must consume
 * auth state via `useAuth()` (e.g. `useAuth().token`) and never reach into
 * `localStorage` themselves — this keeps the storage strategy swappable
 * (e.g. moving to httpOnly cookies later) without touching consumers.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth.types';
import { loginRequest } from '../api/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface StoredAuth {
  user: AuthUser | null;
  token: string | null;
}

function loadStoredAuth(): StoredAuth {
  const rawUser = localStorage.getItem('user');
  const rawToken = localStorage.getItem('token');

  // Nothing stored — fresh state.
  if (rawUser === null && rawToken === null) {
    return { user: null, token: null };
  }

  let parsedUser: AuthUser | null = null;
  let userCorrupt = false;
  if (rawUser !== null) {
    try {
      parsedUser = JSON.parse(rawUser) as AuthUser;
    } catch {
      userCorrupt = true;
    }
  }

  // If either side is missing or corrupt, drop both so we never end up with
  // a half-authenticated state (e.g. token present but user unparseable).
  if (userCorrupt || parsedUser === null || rawToken === null) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { user: null, token: null };
  }

  return { user: parsedUser, token: rawToken };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user: initialUser, token: initialToken }] = useState<StoredAuth>(loadStoredAuth);
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [token, setToken] = useState<string | null>(initialToken);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await loginRequest(credentials);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: !!token, login, logout }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
