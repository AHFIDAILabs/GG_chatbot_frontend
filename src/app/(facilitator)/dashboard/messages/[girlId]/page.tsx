'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter }                                       from 'next/navigation';
import api                                                 from '../../../../../lib/axios';
import { useAuth }                                         from '../../../../../hooks';
import {
  onDMMessage, onDMRead, onDMTyping, onDMTypingStop,
  sendTyping, stopTyping,
} from '../../../../../lib/socket';
import { DMThread, DMMessage } from '../../../../../types';

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

interface GirlProfile {
  _id: string;
  name: string;
  ageGroup: string | null;
  lastLoginAt: string | null;
}

export default function FacilitatorChatPage({ params }: { params: { girlId: string } }) {
  const { girlId } = params;
  const router     = useRouter();
  const { user }   = useAuth();

  const [thread,     setThread]     = useState<DMThread | null>(null);
  const [messages,   setMessages]   = useState<DMMessage[]>([]);
  const [girl,       setGirl]       = useState<GirlProfile | null>(null);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ success: true; data: { thread: DMThread } }>(
          `/facilitator/messages/${girlId}`,
        );
        const t = data.data.thread;
        setThread(t);
        setMessages(t.messages);
        if (typeof t.girlId === 'object') {
          setGirl(t.girlId as GirlProfile);
        }
        scrollToBottom();
      } finally {
        setLoading(false);
      }
    })();
  }, [girlId, scrollToBottom]);

  // Socket listeners — only handle messages for this girlId
  useEffect(() => {
    const offMsg = onDMMessage(({ message, girlId: senderGirlId }) => {
      if (senderGirlId !== girlId) return;
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
    const offRead = onDMRead(() => {
      setMessages(prev => prev.map(m =>
        m.sender === 'facilitator' && m.readAt === null
          ? { ...m, readAt: new Date().toISOString() }
          : m,
      ));
    });
    const offTyping     = onDMTyping(({ senderName }) => setTypingName(senderName));
    const offTypingStop = onDMTypingStop(() => setTypingName(null));
    return () => { offMsg(); offRead(); offTyping(); offTypingStop(); };
  }, [girlId, scrollToBottom]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    sendTyping(girlId, user?.name ?? 'Facilitator');
    typingTimer.current = setTimeout(() => stopTyping(girlId), 2500);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    stopTyping(girlId);
    setSending(true);
    try {
      const { data } = await api.post<{ success: true; data: { message: DMMessage } }>(
        `/facilitator/messages/${girlId}`, { content },
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
        Loading conversation…
      </div>
    );
  }

  const groups = groupByDate(messages);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Chat panel ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-3 flex items-center gap-3 border-b shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="text-[18px] mr-1"
            style={{ background: 'none', border: 'none', color: 'var(--txt-3)', cursor: 'pointer', padding: 0 }}
          >
            ←
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {(girl?.name ?? 'G').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold" style={{ color: 'var(--txt-1)' }}>{girl?.name ?? 'Girl'}</div>
            {girl?.ageGroup && (
              <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>
                Age group: {girl.ageGroup}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>
              No messages yet. Start the conversation!
            </div>
          )}
          {groups.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
                <span className="text-[10px]" style={{ color: 'var(--txt-5)' }}>{group.date}</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
              </div>
              {group.messages.map(msg => {
                const isMe = msg.sender === 'facilitator';
                return (
                  <div key={msg._id} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div style={{ maxWidth: '72%' }}>
                      <div
                        className="px-4 py-[10px] text-[13px] leading-relaxed"
                        style={{
                          background:   isMe ? 'var(--accent-dim)' : 'var(--surface-raised)',
                          color:        isMe ? 'var(--accent-text)' : 'var(--txt-2)',
                          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-[3px] text-[9.5px] ${isMe ? 'justify-end' : 'justify-start'}`}
                        style={{ color: 'var(--txt-5)' }}
                      >
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

          {typingName && (
            <div className="flex items-center gap-2 mt-1 mb-2">
              <div className="px-4 py-[10px] rounded-[14px]" style={{ background: 'var(--surface-raised)' }}>
                <div className="flex items-center gap-[4px]">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-[5px] h-[5px] rounded-full"
                      style={{ background: 'var(--accent)', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
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
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <div
            className="flex items-end gap-2 rounded-[12px] px-4 py-2"
            style={{ background: 'var(--surface-input)', border: '1px solid var(--accent-dim)' }}
          >
            <textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${girl?.name ?? 'girl'}…`}
              rows={1}
              className="flex-1 bg-transparent text-[13px] resize-none outline-none py-[6px]"
              style={{ color: '#e8f5ee', fontFamily: 'DM Sans, sans-serif', maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--surface-raised)',
                color:      input.trim() ? '#09160d' : 'var(--txt-4)',
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
      </div>

      {/* ── Girl profile panel ── */}
      {girl && (
        <div
          className="hidden md:flex flex-col shrink-0 border-l overflow-y-auto"
          style={{ width: 220, borderColor: 'var(--border)', padding: '20px 16px' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[22px] mx-auto mb-3"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {girl.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-[13.5px] font-bold text-center mb-1" style={{ color: 'var(--txt-1)' }}>{girl.name}</div>
          {girl.ageGroup && (
            <div className="text-[11px] text-center mb-4" style={{ color: 'var(--txt-4)' }}>
              Age group: {girl.ageGroup}
            </div>
          )}

          <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--txt-5)' }}>
            Last active
          </div>
          <div className="text-[12px] mb-4" style={{ color: 'var(--txt-2)' }}>
            {girl.lastLoginAt
              ? new Date(girl.lastLoginAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Never'}
          </div>

          <button
            onClick={() => router.push(`/dashboard/girls`)}
            className="w-full py-2 rounded-[8px] text-[11.5px] border mt-auto"
            style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-strong)', color: 'var(--accent)', cursor: 'pointer' }}
          >
            View Full Profile
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
