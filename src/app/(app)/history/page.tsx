'use client';

import { useRouter }        from 'next/navigation';
import { useConversations } from '../../../hooks/useConversation';
import { useChat }          from '../../../hooks';

export default function HistoryPage() {
  const { items, loading, error, remove } = useConversations();
  const { loadConversation }              = useChat();
  const router                            = useRouter();

  const handleOpen = async (id: string) => {
    await loadConversation(id);
    router.push('/chat');
  };

  const pageInnerStyle: React.CSSProperties = {
    flex:      1,
    overflowY: 'auto',
    padding:   '24px 22px',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div style={pageInnerStyle}>
        <div className="text-[20px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>Chat History</div>
        <div className="text-[12.5px] mb-6" style={{ color: 'var(--txt-4)' }}>
          Your recent conversations with Amara
        </div>

        {loading && (
          <div className="text-[13px] text-center py-10" style={{ color: 'var(--txt-4)' }}>
            Loading…
          </div>
        )}

        {error && (
          <div
            className="text-[12.5px] px-4 py-2 rounded-lg mb-4"
            style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-txt)' }}
          >
            {error}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 opacity-45"
          >
            <div className="text-[40px]">💬</div>
            <p className="text-[13px] text-center" style={{ color: 'var(--txt-3)' }}>
              No conversations yet.<br />Start chatting with Amara!
            </p>
          </div>
        )}

        {items.map(item => (
          <div
            key={item.id}
            onClick={() => handleOpen(item.id)}
            className="rounded-[11px] px-4 py-[14px] mb-[10px] cursor-pointer transition-all duration-200"
            style={{
              background:  'var(--surface-raised)',
              border:      '1px solid var(--border-faint)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
              (e.currentTarget as HTMLDivElement).style.background  = 'var(--surface-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-faint)';
              (e.currentTarget as HTMLDivElement).style.background  = 'var(--surface-raised)';
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px]" style={{ color: 'var(--txt-5)' }}>
                {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
              {item.flagged && (
                <span
                  className="text-[10px] px-2 py-[1px] rounded"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  Flagged
                </span>
              )}
            </div>
            <div className="text-[13.5px] font-semibold mb-1" style={{ color: 'var(--txt-1)' }}>
              {item.preview}
            </div>
            <div
              className="text-[12px] truncate"
              style={{ color: 'var(--txt-3)' }}
            >
              {item.lastMessage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
