// ─────────────────────────────────────────────
// Mirrors backend: models/Conversation.ts
// ─────────────────────────────────────────────
import { Language } from "./auth";

export type MessageRole = 'user' | 'assistant';
export type Intent =
  | 'menstrual_hygiene'
  | 'environment'
  | 'digital_skills'
  | 'life_skills'
  | 'safeguarding'
  | 'off_topic'
  | 'greeting';

export interface Message {
  role:            MessageRole;
  content:         string;
  intent:          Intent | null;
  retrievedChunks: string[];
  pillarSource:    string | null;
  tokensUsed:      number;
  latencyMs:       number;
  timestamp:       string;
}

export interface Conversation {
  _id:         string;
  userId:      string | null;
  ageGroup:    '10-13' | '14-18' | null;
  messages:    Message[];
  isAnonymous: boolean;
  language:    Language;
  flagged:     boolean;
  flagReason:  string | null;
  createdAt:   string;
  updatedAt:   string;
}

// ─────────────────────────────────────────────
// Conversation list preview item
// Mirrors backend: chatController getConversations
// ─────────────────────────────────────────────

export interface ConversationPreview {
  id:           string;
  preview:      string;   // first user message, max 80 chars
  lastMessage:  string;   // last message content, max 80 chars
  messageCount: number;
  flagged:      boolean;
  language:     Language;
  updatedAt:    string;
  createdAt:    string;
}

// ─────────────────────────────────────────────
// Request bodies
// Mirrors backend: middleware/validate.ts
// ─────────────────────────────────────────────

export interface CreateConversationBody {
  ageGroup?:    '10-13' | '14-18' | null;
  isAnonymous?: boolean;
  language?:    Language;
}

export interface SendMessageBody {
  question: string;
}

// ─────────────────────────────────────────────
// Response shapes
// ─────────────────────────────────────────────

export interface ConversationResponse {
  conversation: Conversation;
}

export interface ConversationsResponse {
  items:      ConversationPreview[];
  total:      number;
  page:       number;
  totalPages: number;
}

export interface DeleteResponse {
  message: string;
}

// ─────────────────────────────────────────────
// Period tracker — local only (localStorage)
// Not stored in backend, lives client-side
// ─────────────────────────────────────────────

export type FlowIntensity = 'light' | 'medium' | 'heavy';
export type MoodType      = 'Happy' | 'Calm' | 'Tired' | 'Sad' | 'Irritable';
export type CyclePhase    = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal' | 'Unknown';

export interface PeriodLog {
  id:       string;   // uuid
  date:     string;   // ISO date string YYYY-MM-DD
  flow:     FlowIntensity;
  duration: number;   // days
  notes:    string;
}

export interface SymptomLog {
  id:       string;
  date:     string;   // YYYY-MM-DD
  mood:     MoodType | null;
  symptoms: string[];
}

export interface TrackerStats {
  nextPeriodDays:  number | null;
  nextPeriodDate:  string | null;
  avgCycleLength:  number;
  avgPeriodLength: number;
  currentPhase:    CyclePhase;
  logsCount:       number;
}