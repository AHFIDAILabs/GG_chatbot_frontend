import api                from '../lib/axios';
import {
  RegisterBody,
  LoginBody,
  UpdateMeBody,
  ChangePasswordBody,
  AuthResponse,
  MessageResponse,
} from '../types';

// ─────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const { data } = await api.post<{ success: true; data: AuthResponse }>(
    '/auth/register',
    body
  );
  return data.data;
}

// ─────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { data } = await api.post<{ success: true; data: AuthResponse }>(
    '/auth/login',
    body
  );
  return data.data;
}

// ─────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

// ─────────────────────────────────────────────
// POST /api/v1/auth/refresh
// Called automatically by axios interceptor —
// but exported for manual use if needed
// ─────────────────────────────────────────────

export async function refresh(): Promise<void> {
  await api.post('/auth/refresh');
}

// ─────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────

export async function getMe(): Promise<AuthResponse> {
  const { data } = await api.get<{ success: true; data: AuthResponse }>(
    '/auth/me'
  );
  return data.data;
}

// ─────────────────────────────────────────────
// PATCH /api/v1/auth/me
// ─────────────────────────────────────────────

export async function updateMe(body: UpdateMeBody): Promise<AuthResponse> {
  const { data } = await api.patch<{ success: true; data: AuthResponse }>(
    '/auth/me',
    body
  );
  return data.data;
}

// ─────────────────────────────────────────────
// PATCH /api/v1/auth/change-password
// ─────────────────────────────────────────────

export async function changePassword(body: ChangePasswordBody): Promise<MessageResponse> {
  const { data } = await api.patch<{ success: true; data: MessageResponse }>(
    '/auth/change-password',
    body
  );
  return data.data;
}