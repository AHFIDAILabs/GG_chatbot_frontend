"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authService } from "../services";
import { connectFacilitator, disconnectSocket } from "../lib/socket";
import { User, RegisterBody, LoginBody, UpdateMeBody } from "../types";

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true while fetching /auth/me on mount
  error: string | null;
  isAuth: boolean;
  isFacilitator: boolean;

  register: (body: RegisterBody) => Promise<void>;
  login: (body: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
  updateMe: (body: UpdateMeBody) => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Restore session on mount ───────────────
  // Calls /auth/me — if the httpOnly access_token
  // cookie is valid, we get the user back.
  // If it returns 401 the axios interceptor will
  // attempt a silent refresh before giving up.
  useEffect(() => {
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        // If facilitator — connect socket for safeguarding alerts
        if (user.role === "facilitator") connectFacilitator();
      })
      .catch(() => {
        // No valid session — start as guest
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ──────────────────────────────
  const register = useCallback(async (body: RegisterBody) => {
    setError(null);
    try {
      const { user } = await authService.register(body);
      setUser(user);
      if (user.role === "facilitator") connectFacilitator();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "Registration failed. Please try again.";
      setError(message);
      throw err;
    }
  }, []);

  // ── Login ─────────────────────────────────
  const login = useCallback(async (body: LoginBody) => {
    setError(null);
    try {
      const { user } = await authService.login(body);
      setUser(user);
      if (user.role === "facilitator") connectFacilitator();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "Login failed. Please check your credentials.";
      setError(message);
      throw err;
    }
  }, []);

  // ── Logout ────────────────────────────────
  const logout = useCallback(async () => {
    setError(null);
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    } finally {
      disconnectSocket();
      setUser(null);
    }
  }, []);

  // ── Update profile ────────────────────────
  const updateMe = useCallback(async (body: UpdateMeBody) => {
    setError(null);
    try {
      const { user } = await authService.updateMe(body);
      setUser(user);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Update failed. Please try again.";
      setError(message);
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
        isAuth: !!user,
        isFacilitator: user?.role === "facilitator",
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

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
