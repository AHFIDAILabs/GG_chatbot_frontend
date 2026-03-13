'use client';

import { useAuthContext } from '../context';

// ─────────────────────────────────────────────
// useAuth
//
// Thin convenience wrapper over AuthContext.
// Components import this instead of useAuthContext
// directly — keeps the context internal.
//
// Usage:
//   const { user, login, logout, isAuth } = useAuth();
// ─────────────────────────────────────────────

export function useAuth() {
  return useAuthContext();
}