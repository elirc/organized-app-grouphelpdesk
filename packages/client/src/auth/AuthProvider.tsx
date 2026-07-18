// Author: Sam Rivera
// Issue: Learning Phase 4 - Keep frontend auth state at the app boundary

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { LoginInput, User } from '@helpdesk/shared';

import { api, setAuthToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login(input: LoginInput): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then((response) => setUser(response.data))
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput) {
    const response = await api.auth.login(input);
    setAuthToken(response.data.token);
    setUser(response.data.user);
  }

  async function logout() {
    await api.auth.logout().catch(() => undefined);
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
