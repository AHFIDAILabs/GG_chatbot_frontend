import api                from '../lib/axios';
import { streamMessage }  from '../lib/sse';
import {
  CreateConversationBody,
  ConversationResponse,
  ConversationsResponse,
  DeleteResponse,
  SSEHandlers,
} from '../types';

// ─────────────────────────────────────────────
// POST /api/v1/chat/conversations
// Works for both logged-in and anonymous users
// ─────────────────────────────────────────────

export async function createConversation(
  body: CreateConversationBody = {}
): Promise<ConversationResponse> {
  const { data } = await api.post<{ success: true; data: ConversationResponse }>(
    '/chat/conversations',
    body
  );
  return data.data;
}

// ─────────────────────────────────────────────
// GET /api/v1/chat/conversations
// Paginated list — logged-in users only
// ─────────────────────────────────────────────

export async function getConversations(
  page:  number = 1,
  limit: number = 20
): Promise<ConversationsResponse> {
  const { data } = await api.get<{ success: true; data: ConversationsResponse }>(
    '/chat/conversations',
    { params: { page, limit } }
  );
  return data.data;
}

// ─────────────────────────────────────────────
// GET /api/v1/chat/conversations/:id
// Full conversation with all messages
// ─────────────────────────────────────────────

export async function getConversation(id: string): Promise<ConversationResponse> {
  const { data } = await api.get<{ success: true; data: ConversationResponse }>(
    `/chat/conversations/${id}`
  );
  return data.data;
}

// ─────────────────────────────────────────────
// DELETE /api/v1/chat/conversations/:id
// ─────────────────────────────────────────────

export async function deleteConversation(id: string): Promise<DeleteResponse> {
  const { data } = await api.delete<{ success: true; data: DeleteResponse }>(
    `/chat/conversations/${id}`
  );
  return data.data;
}

// ─────────────────────────────────────────────
// POST /api/v1/chat/conversations/:id/messages
// SSE streaming — delegates to lib/sse.ts
// ─────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  question:       string,
  handlers:       SSEHandlers
): Promise<void> {
  return streamMessage(conversationId, question, handlers);
}

// ─────────────────────────────────────────────
// GET /api/v1/chat/flagged
// Facilitators only
// ─────────────────────────────────────────────

export async function getFlaggedConversations(
  page:  number = 1,
  limit: number = 20
): Promise<ConversationsResponse> {
  const { data } = await api.get<{ success: true; data: ConversationsResponse }>(
    '/chat/flagged',
    { params: { page, limit } }
  );
  return data.data;
}