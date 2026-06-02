// ─────────────────────────────────────────────
// Mirrors backend: models/User.ts
// ─────────────────────────────────────────────

export type UserRole     = 'girl' | 'facilitator' | 'admin';
export type AgeGroupUser = '10-13' | '14-18' | null;
export type Language     = 'en' | 'pidgin' | 'yoruba' | 'hausa';

export interface User {
  id:               string;
  name:             string;
  email:            string;
  role:             UserRole;
  ageGroup:         AgeGroupUser;
  avatar:           string | null;
  preferredLang:    Language;
  consentGiven:     boolean;
  lastLoginAt:      string | null;
  createdAt:        string;
  savedTopics:      string[];
  resourcesVisited: string[];
  badges:           string[];
  groupCode:        string | null;
  facilitatorId:    string | null;
  facilitatorName:  string | null;
}

// ─────────────────────────────────────────────
// Request bodies
// Mirrors backend: middleware/validate.ts schemas
// ─────────────────────────────────────────────

export interface RegisterBody {
  name:          string;
  email:         string;
  password:      string;
  inviteToken?:  string;
  groupCode?:    string;
  ageGroup?:     AgeGroupUser;
  consentGiven?: boolean;
}

export interface LoginBody {
  email:    string;
  password: string;
}

export interface UpdateMeBody {
  name?:          string;
  preferredLang?: Language;
  avatar?:        string;
  ageGroup?:      AgeGroupUser;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword:     string;
}

// ─────────────────────────────────────────────
// Response shapes
// Mirrors backend: authController responses
// ─────────────────────────────────────────────

export interface AuthResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}