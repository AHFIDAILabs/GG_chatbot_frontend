'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import api                                   from '../../../../lib/axios';
import { onDMMessage }                       from '../../../../lib/socket';
import { DMThread }                          from '../../../../types';

function timeAgo(ts: string | null) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function FacilitatorMessagesPage() {
  const router   = useRouter();
  const [threads,      setThreads]      = useState<DMThread[]>([]);
  const [totalUnread,  setTotalUnread]  = useState(0);
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{
        success: true;
        data: { threads: DMThread[]; totalUnread: number };
      }>('/facilitator/messages');
      setThreads(data.data.threads);
      setTotalUnread(data.data.totalUnread);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Update thread list in real-time when a new message arrives
  useEffect(() => {
    const off = onDMMessage(({ girlId, girlName, message }) => {
      setThreads(prev => {
        const idx = prev.findIndex(t => {
          const id = typeof t.girlId === 'object' ? (t.girlId as any)._id : t.girlId;
          return id === girlId;
        });
        if (idx === -1) {
          // Reload to get full thread object
          load();
          return prev;
        }
        const updated = [...prev];
        const t = { ...updated[idx] };
        t.lastContent   = message.content;
        t.lastMessageAt = message.timestamp;
        t.lastSender    = 'girl';
        t.facilitatorUnread = (t.facilitatorUnread ?? 0) + 1;
        updated.splice(idx, 1);
        return [t, ...updated];
      });
      setTotalUnread(n => n + 1);
    });
    return off;
  }, [load]);

  const girlName = (t: DMThread) =>
    typeof t.girlId === 'object' ? (t.girlId as any).name : 'Girl';

  const girlId = (t: DMThread): string =>
    typeof t.girlId === 'object' ? (t.girlId as any)._id : (t.girlId as string);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-5 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="text-[16px] font-bold" style={{ color: 'var(--txt-1)' }}>Messages</div>
          {totalUnread > 0 && (
            <span
              className="text-[10px] font-bold px-[7px] py-[2px] rounded-full"
              style={{ background: 'var(--accent)', color: '#09160d' }}
            >
              {totalUnread}
            </span>
          )}
        </div>
        <div className="text-[12px] mt-[2px]" style={{ color: 'var(--txt-4)' }}>
          Direct conversations with your girls
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-[12px]" style={{ color: 'var(--txt-4)' }}>
            Loading…
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="text-[36px]">💬</div>
            <div className="text-[13px] font-medium" style={{ color: 'var(--txt-1)' }}>No messages yet</div>
            <div className="text-[12px]" style={{ color: 'var(--txt-4)' }}>
              When a girl messages you it will appear here.
            </div>
          </div>
        ) : (
          threads.map(t => {
            const name   = girlName(t);
            const gid    = girlId(t);
            const unread = t.facilitatorUnread ?? 0;
            return (
              <div
                key={t._id}
                onClick={() => router.push(`/dashboard/messages/${gid}`)}
                className="flex items-center gap-3 px-5 py-4 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'var(--border-faint)',
                  background: unread > 0 ? 'var(--surface-hover)' : 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = unread > 0 ? 'var(--surface-hover)' : 'transparent')}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] shrink-0"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <span className={`text-[13px] truncate ${unread > 0 ? 'font-semibold' : 'font-medium'}`}
                      style={{ color: unread > 0 ? 'var(--txt-1)' : 'var(--txt-2)' }}>
                      {name}
                    </span>
                    <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--txt-4)' }}>
                      {timeAgo(t.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] truncate" style={{ color: 'var(--txt-4)' }}>
                      {t.lastSender === 'facilitator' && <span style={{ color: 'rgba(74,222,128,0.5)' }}>You: </span>}
                      {t.lastContent || 'No messages yet'}
                    </span>
                    {unread > 0 && (
                      <span
                        className="ml-2 shrink-0 text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent)', color: '#09160d' }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
