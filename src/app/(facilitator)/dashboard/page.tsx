'use client';

import { useState, useEffect, useCallback } from 'react';
import api                                   from '../../../lib/axios';
import { FlaggedConversation, FacilitatorStatus } from '../../../types';

const STATUS_COLOR: Record<FacilitatorStatus, string> = {
  pending:  '#fbbf24',
  reviewed: '#60a5fa',
  resolved: '#4ade80',
};

async function fetchFlagged(status: FacilitatorStatus | 'all', page: number) {
  const p = new URLSearchParams({ page: String(page), limit: '25' });
  if (status !== 'all') p.set('status', status);
  const { data } = await api.get<{
    success: true;
    data: { conversations: FlaggedConversation[]; total: number; totalPages: number };
  }>(`/facilitator/flagged?${p}`);
  return data.data;
}

export default function DashboardPage() {
  const [conversations, setConversations] = useState<FlaggedConversation[]>([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState<FacilitatorStatus | 'all'>('all');
  const [selected,      setSelected]      = useState<FlaggedConversation | null>(null);
  const [replyText,     setReplyText]     = useState('');
  const [note,          setNote]          = useState('');
  const [saving,        setSaving]        = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchFlagged(filter, 1);
      setConversations(d.conversations);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const patch = async (path: string, body?: object) => {
    setSaving(true);
    try {
      const { data } = await api.patch<{ success: true; data: { conversation: FlaggedConversation } }>(path, body);
      const updated = data.data.conversation;
      setConversations(prev => prev.map(c => c._id === updated._id ? updated : c));
      setSelected(updated);
    } finally { setSaving(false); }
  };

  const postReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post<{ success: true; data: { conversation: FlaggedConversation } }>(
        `/facilitator/conversations/${selected._id}/reply`,
        { reply: replyText.trim() },
      );
      const updated = data.data.conversation;
      setConversations(prev => prev.map(c => c._id === updated._id ? updated : c));
      setSelected(updated);
      setReplyText('');
    } finally { setSaving(false); }
  };

  const counts: Record<string, number> = { all: total };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: conversation list ── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 300, borderColor: 'var(--border)' }}>

        {/* Filter bar */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'var(--txt-4)' }}>
            Filter by status
          </div>
          <div className="flex flex-wrap gap-1">
            {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="text-[10.5px] px-[8px] py-[3px] rounded-full transition-all"
                style={{
                  background: filter === s ? 'var(--accent-dim)' : 'var(--surface-input)',
                  border:     `1px solid ${filter === s ? 'rgba(74,222,128,0.25)' : 'var(--border-faint)'}`,
                  color:      filter === s ? 'var(--accent)' : 'var(--txt-3)',
                  cursor:     'pointer',
                }}
              >
                {s === 'all' ? `All (${total})` : s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>
              No {filter !== 'all' ? filter : ''} alerts
            </div>
          ) : (
            conversations.map(c => {
              const girl = c.userId as { name?: string } | null;
              return (
                <div
                  key={c._id}
                  onClick={() => { setSelected(c); setNote(''); setReplyText(''); }}
                  className="px-4 py-3 cursor-pointer border-b transition-colors"
                  style={{
                    borderColor: 'var(--border-faint)',
                    background:  selected?._id === c._id ? 'var(--surface-hover)' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-[3px]">
                    <span className="text-[12.5px] font-medium truncate pr-2" style={{ color: 'var(--txt-1)' }}>
                      {girl?.name ?? 'Anonymous'}
                    </span>
                    <span
                      className="text-[9.5px] px-[6px] py-[1px] rounded-full shrink-0"
                      style={{ background: `${STATUS_COLOR[c.facilitatorStatus]}18`, color: STATUS_COLOR[c.facilitatorStatus] }}
                    >
                      {c.facilitatorStatus}
                    </span>
                  </div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--txt-4)' }}>
                    {c.flagReason ?? 'Safeguarding concern'}
                  </div>
                  <div className="text-[10px] mt-[2px]" style={{ color: 'var(--txt-5)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <div className="text-[32px]">🚨</div>
            <div className="text-[13px]" style={{ color: 'var(--txt-4)' }}>Select a flagged alert to review</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b flex items-start justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-[15px] font-bold" style={{ color: 'var(--txt-1)' }}>
                  {(selected.userId as { name?: string } | null)?.name ?? 'Anonymous'}
                </div>
                <div className="text-[11px] mt-[2px]" style={{ color: 'var(--txt-4)' }}>
                  {selected.flagReason} · {new Date(selected.createdAt).toLocaleString('en-GB')}
                </div>
                {selected.facilitatorReply && (
                  <div className="text-[10.5px] mt-1" style={{ color: 'var(--accent)' }}>
                    ✓ Reply already sent
                  </div>
                )}
              </div>
              <span
                className="text-[11px] px-[9px] py-[3px] rounded-full shrink-0"
                style={{
                  background: `${STATUS_COLOR[selected.facilitatorStatus]}15`,
                  border:     `1px solid ${STATUS_COLOR[selected.facilitatorStatus]}33`,
                  color:       STATUS_COLOR[selected.facilitatorStatus],
                }}
              >
                {selected.facilitatorStatus}
              </span>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-5">
              {selected.messages.slice(-12).map((m, i) => (
                <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[80%] px-4 py-2 rounded-[11px] text-[12.5px] leading-relaxed"
                    style={{
                      background: m.role === 'user'
                        ? 'var(--surface-active)'
                        : 'var(--surface-raised)',
                      color: m.role === 'user' ? 'var(--accent-text)' : 'var(--txt-2)',
                    }}
                  >
                    {m.content}
                    <div className="text-[9.5px] mt-1 opacity-40">
                      {new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {selected.facilitatorReply && (
                <div className="mt-4 p-3 rounded-[9px]" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)' }}>
                  <div className="text-[9.5px] uppercase tracking-wider mb-1" style={{ color: 'rgba(147,197,253,0.5)' }}>
                    Your reply (sent to girl)
                  </div>
                  <div className="text-[12.5px]" style={{ color: '#93c5fd' }}>{selected.facilitatorReply}</div>
                </div>
              )}
            </div>

            {/* Action toolbar */}
            {selected.facilitatorStatus !== 'resolved' && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Internal note (not visible to girl)…"
                  className="w-full bg-transparent text-[12px] outline-none mb-3 pb-2"
                  style={{ borderBottom: '1px solid var(--border-faint)', color: 'var(--txt-3)', fontFamily: 'DM Sans, sans-serif' }}
                />
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply to the girl…"
                  rows={2}
                  className="w-full bg-transparent text-[13px] outline-none resize-none mb-3 pb-2"
                  style={{ borderBottom: '1px solid var(--border-faint)', color: '#e8f5ee', fontFamily: 'DM Sans, sans-serif' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => patch(`/facilitator/conversations/${selected._id}/acknowledge`, { note: note || null })}
                    disabled={saving}
                    className="flex-1 py-[8px] rounded-[7px] text-[12px] transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#93c5fd', cursor: 'pointer' }}
                  >
                    Acknowledge
                  </button>
                  {replyText.trim() && (
                    <button
                      onClick={postReply}
                      disabled={saving}
                      className="flex-1 py-[8px] rounded-[7px] text-[12px] transition-opacity hover:opacity-80"
                      style={{ background: 'var(--surface-active)', border: '1px solid var(--border-strong)', color: 'var(--accent)', cursor: 'pointer' }}
                    >
                      Send Reply
                    </button>
                  )}
                  <button
                    onClick={() => patch(`/facilitator/conversations/${selected._id}/resolve`)}
                    disabled={saving}
                    className="flex-1 py-[8px] rounded-[7px] text-[12px] transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', color: 'var(--accent)', cursor: 'pointer' }}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
