'use client';

import { useChatContext } from '../context';

// ─────────────────────────────────────────────
// useChat
//
// Exposes the active conversation state and
// all messaging actions from ChatContext.
//
// Usage:
//   const {
//     messages, streaming, streamBuffer,
//     sendMessage, startConversation,
//   } = useChat();
// ─────────────────────────────────────────────

export function useChat() {
  return useChatContext();
}