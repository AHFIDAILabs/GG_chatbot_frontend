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

export interface ServerToClientEvents {
  'safeguarding:alert': (payload: SafeguardingAlertPayload) => void;
  'chat:token':         (token: string) => void;
  'chat:done':          () => void;
  'chat:error':         (message: string) => void;
}

export interface ClientToServerEvents {
  'room:join': (room: string) => void;
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