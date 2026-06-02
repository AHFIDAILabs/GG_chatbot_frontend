"use client";

import { useState, useEffect } from "react";
import { useRouter }            from "next/navigation";
import Sidebar  from "../../components/Sidebar";
import Header   from "../../components/Header";
import SOSModal from "../../components/SosModal";
import { useChat } from "../../hooks";
import { useAuth } from "../../hooks";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const { sendMessage } = useChat();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const handleChipClick = (text: string) => {
    router.push("/chat");
    setTimeout(() => sendMessage(text), 100);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onChipClick={handleChipClick}
        onSOSClick={() => setShowSOS(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((p) => !p)}
          onSOSClick={() => setShowSOS(true)}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      <SOSModal show={showSOS} onClose={() => setShowSOS(false)} />
    </div>
  );
}
