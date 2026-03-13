'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatService }                       from '../services';
import { ConversationPreview }               from '../types';

// ─────────────────────────────────────────────
// useConversations
//
// Fetches the user's paginated conversation list
// from GET /api/v1/chat/conversations.
// Used by the History page.
//
// Usage:
//   const {
//     items, loading, error,
//     page, totalPages,
//     nextPage, prevPage, remove, refresh,
//   } = useConversations();
// ─────────────────────────────────────────────

interface UseConversationsReturn {
  items:       ConversationPreview[];
  loading:     boolean;
  error:       string | null;
  page:        number;
  totalPages:  number;
  total:       number;
  nextPage:    () => void;
  prevPage:    () => void;
  remove:      (id: string) => Promise<void>;
  refresh:     () => void;
}

export function useConversations(limit = 20): UseConversationsReturn {
  const [items,      setItems]      = useState<ConversationPreview[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [tick,       setTick]       = useState(0); // bump to re-fetch

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatService.getConversations(page, limit);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load conversations.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, tick]);

  useEffect(() => { fetch(); }, [fetch]);

  const nextPage = useCallback(() => {
    setPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(p - 1, 1));
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      // Optimistic removal then re-fetch to keep pagination correct
      setItems(prev => prev.filter(c => c.id !== id));
      setTotal(prev => prev - 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not delete conversation.');
    }
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    total,
    nextPage,
    prevPage,
    remove,
    refresh,
  };
}