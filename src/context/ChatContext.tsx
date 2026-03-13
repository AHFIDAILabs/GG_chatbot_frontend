'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { chatService }                from '../services';
import {
  Conversation,
  Message,
  CreateConversationBody,
} from '../types';

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface ChatContextValue {
  // Active conversation
  conversation:  Conversation | null;
  messages:      Message[];
  streaming:     boolean;       // true while SSE tokens are arriving
  streamBuffer:  string;        // accumulates tokens during stream
  error:         string | null;

  // Actions
  startConversation:  (body?: CreateConversationBody) => Promise<void>;
  sendMessage:        (question: string)              => Promise<void>;
  loadConversation:   (id: string)                    => Promise<void>;
  clearConversation:  ()                              => void;
  clearError:         ()                              => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [streaming,    setStreaming]     = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [error,        setError]        = useState<string | null>(null);

  // Ref to track if a stream is still active —
  // prevents state updates after unmount
  const streamingRef   = useRef(false);
  // Ref to accumulate tokens without stale closure issues
  const streamBufferRef = useRef('');

  // ── Start a new conversation ───────────────
  // Creates conversation on backend, resets UI state
  const startConversation = useCallback(async (body: CreateConversationBody = {}) => {
    setError(null);
    try {
      const { conversation } = await chatService.createConversation(body);
      setConversation(conversation);
      setMessages([]);
      setStreamBuffer('');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not start a conversation. Please try again.';
      setError(message);
      throw err;
    }
  }, []);

  // ── Load an existing conversation ──────────
  const loadConversation = useCallback(async (id: string) => {
    setError(null);
    try {
      const { conversation } = await chatService.getConversation(id);
      setConversation(conversation);
      setMessages(conversation.messages);
      setStreamBuffer('');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not load conversation.';
      setError(message);
      throw err;
    }
  }, []);

  // ── Send a message ─────────────────────────
  // 1. Optimistically append the user message
  // 2. Create conversation if none exists
  // 3. Stream Amara's response token by token
  // 4. On done — append the full assistant message
  const sendMessage = useCallback(async (question: string) => {
    if (streaming) return;
    setError(null);

    // Optimistic user message — no backend fields yet
    const userMsg: Message = {
      role:            'user',
      content:         question,
      intent:          null,
      retrievedChunks: [],
      pillarSource:    null,
      tokensUsed:      0,
      latencyMs:       0,
      timestamp:       new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Create conversation on first message if needed
    let activeConversation = conversation;
    if (!activeConversation) {
      try {
        const { conversation: newConvo } = await chatService.createConversation({});
        activeConversation = newConvo;
        setConversation(newConvo);
      } catch (err: any) {
        const message = err?.response?.data?.message ?? 'Could not start conversation.';
        setError(message);
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m !== userMsg));
        return;
      }
    }

    // Begin streaming
    setStreaming(true);
    streamingRef.current    = true;
    streamBufferRef.current = '';
    setStreamBuffer('');

    await chatService.sendMessage(activeConversation._id, question, {
      onToken: (token) => {
        if (!streamingRef.current) return;
        streamBufferRef.current += token;
        setStreamBuffer(streamBufferRef.current);
      },

      onDone: (data) => {
        if (!streamingRef.current) return;
        const fullContent = streamBufferRef.current;
        setMessages(prev => [
          ...prev,
          {
            role:            'assistant',
            content:         fullContent,
            intent:          data.intent as any ?? null,
            retrievedChunks: [],
            pillarSource:    data.pillarSource,
            tokensUsed:      data.tokensUsed,
            latencyMs:       data.latencyMs,
            timestamp:       new Date().toISOString(),
          },
        ]);
        streamBufferRef.current = '';
        setStreamBuffer('');
        setStreaming(false);
        streamingRef.current = false;
      },

      onError: (message) => {
        setError(message);
        streamBufferRef.current = '';
        setStreamBuffer('');
        setStreaming(false);
        streamingRef.current = false;
      },
    });
  }, [conversation, streaming]);

  // ── Clear active conversation ──────────────
  const clearConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setStreamBuffer('');
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider
      value={{
        conversation,
        messages,
        streaming,
        streamBuffer,
        error,
        startConversation,
        sendMessage,
        loadConversation,
        clearConversation,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside <ChatProvider>');
  return ctx;
}