'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import Sidebar                 from '../../components/Sidebar';
import Header                  from '../../components/Header';
import SOSModal                from '../../components/SosModal';
import { useChat }             from '../../hooks';
import { useAuth }             from '../../hooks';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOS,          setShowSOS]          = useState(false);
  const { sendMessage }                          = useChat();
  const { user, isGuest, loading }               = useAuth();
  const router                                   = useRouter();

  // ── Auth guard ────────────────────────────
  // While loading: show nothing (avoids flash)
  // Not logged in and not guest: redirect to /login
  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.replace('/login');
    }
  }, [loading, user, isGuest, router]);

  const handleChipClick = (text: string) => {
    router.push('/chat');
    setTimeout(() => sendMessage(text), 100);
  };

  // Show nothing while checking auth
  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: '#09160d' }}
      >
        <div
          className="w-[32px] h-[32px] rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(74,222,128,0.2)', borderTopColor: '#4ade80' }}
        />
      </div>
    );
  }

  // Not authed and not guest — render nothing while redirect happens
  if (!user && !isGuest) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#09160d' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onChipClick={handleChipClick}
        onSOSClick={() => setShowSOS(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(p => !p)}
          onSOSClick={() => setShowSOS(true)}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      <SOSModal show={showSOS} onClose={() => setShowSOS(false)} />
    </div>
  );
}