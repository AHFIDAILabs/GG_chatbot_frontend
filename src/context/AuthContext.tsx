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
  isGuest:       boolean;   // true when user explicitly chose "continue without signing in"
  isFacilitator: boolean;

  register:      (body: RegisterBody) => Promise<void>;
  login:         (body: LoginBody)    => Promise<void>;
  logout:        ()                   => Promise<void>;
  updateMe:      (body: UpdateMeBody) => Promise<void>;
  continueAsGuest: ()                 => void;
  clearError:    ()                   => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  // isGuest: persisted in sessionStorage so refresh keeps guest mode
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Restore guest flag from sessionStorage
    const savedGuest = sessionStorage.getItem('ggcl_guest') === 'true';
    if (savedGuest) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        if (user.role === 'facilitator') connectFacilitator();
      })
      .catch(() => {
        setUser(null);
        // Don't set guest here — let the layout redirect to /login
      })
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (body: RegisterBody) => {
    setError(null);
    try {
      const { user } = await authService.register(body);
      setUser(user);
      setIsGuest(false);
      sessionStorage.removeItem('ggcl_guest');
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
      setIsGuest(false);
      sessionStorage.removeItem('ggcl_guest');
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
      setIsGuest(false);
      sessionStorage.removeItem('ggcl_guest');
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

  const continueAsGuest = useCallback(() => {
    sessionStorage.setItem('ggcl_guest', 'true');
    setIsGuest(true);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuth:        !!user,
        isGuest,
        isFacilitator: user?.role === 'facilitator',
        register,
        login,
        logout,
        updateMe,
        continueAsGuest,
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