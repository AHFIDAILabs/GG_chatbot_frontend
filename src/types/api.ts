// ─────────────────────────────────────────────
// Standard API response wrapper
// Mirrors backend: utils/response.ts
// ─────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
}

export interface ApiError {
  success: false;
  message: string;
  code?:   string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface PaginatedResult<T> {
  items:      T[];
  total:      number;
  page:       number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// SSE events
// Mirrors backend: chatController sendMessage
// event: token  → { token: string }
// event: done   → { conversationId, latencyMs, tokensUsed, pillarSource, intent }
// event: error  → { message: string }
// ─────────────────────────────────────────────

export interface SSETokenEvent {
  token: string;
}

export interface SSEDoneEvent {
  conversationId: string;
  latencyMs:      number;
  tokensUsed:     number;
  pillarSource:   string | null;
  intent:         string;
}

export interface SSEErrorEvent {
  message: string;
}

// ─────────────────────────────────────────────
// Socket.io event maps
// Mirrors backend: types/index.ts
// ─────────────────────────────────────────────

export interface SafeguardingAlertPayload {
  conversationId: string;
  userId:         string | null;
  flagReason:     string;
  messageSnippet: string;
  timestamp:      string;
}

// ─────────────────────────────────────────────
// Direct-message types
// Mirrors backend: models/DirectThread.ts
// ─────────────────────────────────────────────

export interface DMMessage {
  _id:       string;
  sender:    'girl' | 'facilitator';
  content:   string;
  timestamp: string;
  readAt:    string | null;
}

export interface DMThread {
  _id:               string;
  girlId:            string | { _id: string; name: string; ageGroup: string | null; lastLoginAt: string | null };
  facilitatorId:     string | { _id: string; name: string };
  messages:          DMMessage[];
  girlUnread:        number;
  facilitatorUnread: number;
  lastMessageAt:     string | null;
  lastSender:        'girl' | 'facilitator' | null;
  lastContent:       string;
}

export interface DMMessagePayload {
  threadId:      string;
  message:       DMMessage;
  girlId?:       string;
  girlName?:     string;
  facilitatorId?: string;
}

export interface DMReadPayload {
  by:      'girl' | 'facilitator';
  girlId?: string;
}

export interface ServerToClientEvents {
  'safeguarding:alert': (payload: SafeguardingAlertPayload) => void;
  'chat:token':         (token: string) => void;
  'chat:done':          () => void;
  'chat:error':         (message: string) => void;
  'dm:message':         (payload: DMMessagePayload) => void;
  'dm:read':            (payload: DMReadPayload) => void;
  'dm:typing':          (payload: { senderName: string }) => void;
  'dm:typing:stop':     () => void;
}

export interface ClientToServerEvents {
  'room:join':      (room: string) => void;
  'dm:join':        (userId: string) => void;
  'dm:typing':      (payload: { recipientId: string; senderName: string }) => void;
  'dm:typing:stop': (payload: { recipientId: string }) => void;
}

// ─────────────────────────────────────────────
// SSE handler callbacks
// Mirrors lib/sse.ts SSEHandlers interface
// Re-exported here so services can import from types
// ─────────────────────────────────────────────

export interface SSEHandlers {
  onToken: (token: string)      => void;
  onDone:  (data: SSEDoneEvent) => void;
  onError: (message: string)    => void;
}