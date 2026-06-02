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
// Period tracker — synced with backend
// ─────────────────────────────────────────────

export type FlowIntensity = 'light' | 'medium' | 'heavy';
export type MoodType      = 'Happy' | 'Calm' | 'Tired' | 'Sad' | 'Irritable';
export type CyclePhase    = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal' | 'Unknown';

export interface PeriodLog {
  id:       string;   // uuid (local) or _id (backend)
  _id?:     string;
  date:     string;   // ISO date string YYYY-MM-DD
  startDate?: string; // backend field alias
  flow:     FlowIntensity;
  duration: number | null;
  notes:    string;
}

export interface SymptomLog {
  id:       string;
  date:     string;
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

export interface CyclePrediction {
  nextStart:      string;
  nextEnd:        string;
  avgCycleLength: number;
  avgDuration:    number;
  basedOnCycles:  number;
}

// ─────────────────────────────────────────────
// Wellbeing
// ─────────────────────────────────────────────

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface WellbeingLog {
  _id:       string;
  date:      string;
  mood:      MoodScore;
  note:      string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Goals
// ─────────────────────────────────────────────

export type GoalPillar = 'menstrual_hygiene' | 'environment' | 'digital_skills' | 'life_skills' | 'personal';
export type GoalStatus = 'not_started' | 'in_progress' | 'done';

export interface GoalStep {
  _id:  string;
  text: string;
  done: boolean;
}

export interface Goal {
  _id:       string;
  title:     string;
  pillar:    GoalPillar;
  deadline:  string | null;
  steps:     GoalStep[];
  status:    GoalStatus;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Facilitator workflow
// ─────────────────────────────────────────────

export type FacilitatorStatus = 'pending' | 'reviewed' | 'resolved';

export interface FlaggedConversation {
  _id:               string;
  userId:            { _id: string; name: string; email: string; ageGroup: string | null } | null;
  flagReason:        string | null;
  facilitatorStatus: FacilitatorStatus;
  facilitatorNote:   string | null;
  facilitatorReply:  string | null;
  reviewedBy:        { _id: string; name: string } | null;
  reviewedAt:        string | null;
  messages:          { role: string; content: string; timestamp: string }[];
  createdAt:         string;
}