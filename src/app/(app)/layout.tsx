'use client';

import { useState }           from 'react';
import { useRouter }          from 'next/navigation';
import Sidebar                from '../../components/Sidebar';
import Header                 from '../../components/Header';
import SOSModal               from '../../components/SosModal';
import { useChat }            from '../../hooks';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOS,          setShowSOS]          = useState(false);
  const { sendMessage, startConversation }       = useChat();
  const router                                   = useRouter();

  const handleChipClick = async (text: string) => {
    router.push('/chat');
    // Small delay to let navigation complete before sending
    setTimeout(() => sendMessage(text), 100);
  };

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