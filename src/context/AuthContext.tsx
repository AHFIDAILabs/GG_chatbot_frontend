'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService }                         from '../services';
import { connectFacilitator, disconnectSocket } from '../lib/socket';
import { User, RegisterBody, LoginBody, UpdateMeBody } from '../types';

interface AuthContextValue {
  user:          User | null;
  loading:       boolean;
  error:         string | null;
  isAuth:        boolean;
  isFacilitator: boolean;

  register:  (body: RegisterBody) => Promise<void>;
  login:     (body: LoginBody)    => Promise<void>;
  logout:    ()                   => Promise<void>;
  updateMe:  (body: UpdateMeBody) => Promise<void>;
  clearError: ()                  => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // Silently restore session — if no cookie, user stays null (guest)
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        if (user.role === 'facilitator') connectFacilitator();
      })
      .catch(() => setUser(null))   // no session = unauthenticated, that's fine
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (body: RegisterBody) => {
    setError(null);
    try {
      const { user } = await authService.register(body);
      setUser(user);
      if (user.role === 'facilitator') connectFacilitator();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
      throw err;
    }
  }, []);

  const login = useCallback(async (body: LoginBody) => {
    setError(null);
    try {
      const { user } = await authService.login(body);
      setUser(user);
      if (user.role === 'facilitator') connectFacilitator();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please check your credentials.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authService.logout();
    } catch {
      // clear local state regardless
    } finally {
      disconnectSocket();
      setUser(null);
    }
  }, []);

  const updateMe = useCallback(async (body: UpdateMeBody) => {
    setError(null);
    try {
      const { user } = await authService.updateMe(body);
      setUser(user);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Update failed. Please try again.');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuth:        !!user,
        isFacilitator: user?.role === 'facilitator',
        register,
        login,
        logout,
        updateMe,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}