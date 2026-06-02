'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import { useAuth }             from '../../hooks';
import FacilitatorSidebar      from '../../components/FacilitatorSidebar';
import ThemeToggle             from '../../components/ThemeToggle';

export default function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Guard: non-facilitators are sent back to /chat
  useEffect(() => {
    if (!loading && user && user.role !== 'facilitator') {
      router.replace('/chat');
    }
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'facilitator') {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <span className="text-[13px]" style={{ color: 'var(--txt-4)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <FacilitatorSidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-5 h-[52px] flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <button
            onClick={() => setCollapsed(p => !p)}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-lg text-[14px] transition-all"
            style={{ background: 'var(--surface-input)', border: '1px solid var(--border-faint)', color: 'var(--txt-3)', cursor: 'pointer' }}
          >
            {collapsed ? '→' : '←'}
          </button>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--txt-1)' }}>Facilitator Portal</span>
          <ThemeToggle />
          <span
            className="ml-auto text-[11px] px-[9px] py-[3px] rounded-full"
            style={{ background: 'var(--surface-active)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}
          >
            {user.name}
          </span>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
