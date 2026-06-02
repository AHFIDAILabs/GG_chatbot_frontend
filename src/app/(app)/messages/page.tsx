'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter }                                  from 'next/navigation';
import api from '../../../lib/axios';
import { useAuth } from '../../../hooks';
import {
  onDMMessage, onDMRead, onDMTyping, onDMTypingStop,
  sendTyping, stopTyping,
} from '../../../lib/socket';
import { DMThread, DMMessage } from '../../../types';

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function groupByDate(messages: DMMessage[]) {
  const groups: { date: string; messages: DMMessage[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groups.push({ date, messages: [msg] });
  }
  return groups;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const router   = useRouter();

  // Facilitators and admins don't use this page
  useEffect(() => {
    if (user?.role === 'facilitator') router.replace('/dashboard/messages');
    else if (user?.role === 'admin')  router.replace('/admin');
  }, [user, router]);
  const [thread,       setThread]       = useState<DMThread | null>(null);
  const [messages,     setMessages]     = useState<DMMessage[]>([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [typingName,   setTypingName]   = useState<string | null>(null);
  const [noFacilitator, setNoFacilitator] = useState(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const typingTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const facilitatorId = typeof thread?.facilitatorId === 'object'
    ? (thread.facilitatorId as { _id: string; name: string })._id
    : thread?.facilitatorId ?? '';

  const facilitatorName = typeof thread?.facilitatorId === 'object'
    ? (thread.facilitatorId as { _id: string; name: string }).name
    : user?.facilitatorName ?? 'Your Facilitator';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, []);

  // Load thread
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ success: true; data: { thread: DMThread } }>('/messages');
        setThread(data.data.thread);
        setMessages(data.data.thread.messages);
        scrollToBottom();
      } catch (err: any) {
        if (err?.response?.status === 400) setNoFacilitator(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [scrollToBottom]);

  // Socket listeners
  useEffect(() => {
    const offMsg = onDMMessage(({ message }) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
    const offRead = onDMRead(() => {
      setMessages(prev => prev.map(m =>
        m.sender === 'girl' && m.readAt === null
          ? { ...m, readAt: new Date().toISOString() }
          : m,
      ));
    });
    const offTyping    = onDMTyping(({ senderName }) => setTypingName(senderName));
    const offTypingStop = onDMTypingStop(() => setTypingName(null));
    return () => { offMsg(); offRead(); offTyping(); offTypingStop(); };
  }, [scrollToBottom]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!facilitatorId) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    sendTyping(facilitatorId, user?.name ?? 'Girl');
    typingTimer.current = setTimeout(() => stopTyping(facilitatorId), 2500);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (facilitatorId) stopTyping(facilitatorId);
    setSending(true);
    try {
      const { data } = await api.post<{ success: true; data: { message: DMMessage } }>(
        '/messages', { content },
      );
      setMessages(prev => [...prev, data.data.message]);
      scrollToBottom();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[13px]" style={{ color: 'var(--txt-4)' }}>
        Loading messages…
      </div>
    );
  }

  if (noFacilitator) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3 text-center px-6">
        <div className="text-[32px]">👩‍🏫</div>
        <div className="text-[14px] font-medium" style={{ color: 'var(--txt-1)' }}>No facilitator assigned yet</div>
        <div className="text-[12px] max-w-[300px]" style={{ color: 'var(--txt-3)' }}>
          A facilitator will be linked to your account soon. You will be able to chat with them here.
        </div>
      </div>
    );
  }

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          {facilitatorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-[13.5px] font-semibold" style={{ color: 'var(--txt-1)' }}>{facilitatorName}</div>
          <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>Your facilitator</div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>
            No messages yet. Say hello to {facilitatorName}!
          </div>
        )}
        {groups.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
              <span className="text-[10px] tracking-wide" style={{ color: 'var(--txt-5)' }}>
                {group.date}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
            </div>

            {group.messages.map(msg => {
              const isMe = msg.sender === 'girl';
              return (
                <div key={msg._id} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div style={{ maxWidth: '72%' }}>
                    <div
                      className="px-4 py-[10px] rounded-[14px] text-[13px] leading-relaxed"
                      style={{
                        background:  isMe ? 'var(--accent-dim)' : 'var(--surface-raised)',
                        color:       isMe ? 'var(--accent-text)' : 'var(--txt-2)',
                        borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      }}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 mt-[3px] text-[9.5px] ${isMe ? 'justify-end' : 'justify-start'}`}
                      style={{ color: 'var(--txt-5)' }}>
                      {formatTime(msg.timestamp)}
                      {isMe && (
                        <span style={{ color: msg.readAt ? 'var(--accent)' : 'var(--txt-4)', marginLeft: 2 }}>
                          {msg.readAt ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingName && (
          <div className="flex items-center gap-2 mt-1 mb-2">
            <div className="px-4 py-[10px] rounded-[14px]" style={{ background: 'var(--surface-raised)' }}>
              <div className="flex items-center gap-[4px]">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-[5px] h-[5px] rounded-full"
                    style={{
                      background: 'var(--accent)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--txt-4)' }}>{typingName} is typing…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 border-t shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div
          className="flex items-end gap-2 rounded-[12px] px-4 py-2"
          style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-input)' }}
        >
          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${facilitatorName}…`}
            rows={1}
            className="flex-1 bg-transparent text-[13px] resize-none outline-none py-[6px]"
            style={{
              color: 'var(--txt-1)',
              fontFamily: 'DM Sans, sans-serif',
              maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: input.trim() ? 'var(--accent)' : 'var(--surface-raised)',
              color:      input.trim() ? '#ffffff' : 'var(--txt-4)',
              cursor:     input.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            ↑
          </button>
        </div>
        <div className="text-[10px] mt-1 pl-1" style={{ color: 'var(--txt-5)' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
