"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import SOSModal from "../../components/SosModal";
import { useChat } from "../../hooks";

// No auth guard — everyone lands here directly.
// Registration is prompted softly inside the chat
// after a few messages, not as a gate at entry.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const { sendMessage } = useChat();
  const router = useRouter();

  const handleChipClick = (text: string) => {
    router.push("/chat");
    setTimeout(() => sendMessage(text), 100);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#09160d" }}
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
