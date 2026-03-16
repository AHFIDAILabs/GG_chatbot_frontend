"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "../../../hooks";
import { useAuth } from "../../../hooks";
import MessageBubble from "../../../components/MessageBubbles";
import ChatInput from "../../../components/ChatInput";
import EmptyState from "../../../components/EmptyState";

const PROMPT_AFTER = 3; // show after this many assistant replies
const STORAGE_DISMISSED = "ggcl_save_prompt_dismissed";
const STORAGE_MSG_COUNT = "ggcl_guest_msg_count";

export default function ChatPage() {
  const { messages, streaming, streamBuffer, sendMessage, error } = useChat();

  const { user } = useAuth();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage — default false until client reads storage
  const [dismissed, setDismissed] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // On mount — read persisted state from localStorage
  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_DISMISSED) === "true";
    const savedCount = parseInt(
      localStorage.getItem(STORAGE_MSG_COUNT) || "0",
      10,
    );
    setDismissed(wasDismissed);
    setMsgCount(savedCount);
    setHydrated(true);
  }, []);

  // Track assistant message count — persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    const assistantCount = messages.filter(
      (m) => m.role === "assistant",
    ).length;
    if (assistantCount > msgCount) {
      setMsgCount(assistantCount);
      localStorage.setItem(STORAGE_MSG_COUNT, String(assistantCount));
    }
  }, [messages, hydrated]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_DISMISSED, "true");
  };

  // Show prompt when: not logged in, not dismissed, threshold reached
  const showSavePrompt =
    hydrated && !user && !dismissed && msgCount >= PROMPT_AFTER;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Save prompt banner */}
      {showSavePrompt && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: "rgba(74,222,128,0.07)",
            borderBottom: "1px solid rgba(74,222,128,0.14)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] shrink-0">💾</span>
            <span
              className="text-[12.5px] leading-snug"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Want to save this chat? Create a free account — takes 30 seconds.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/register")}
              className="px-3 py-[5px] rounded-lg text-[12px] font-bold border-none"
              style={{
                background: "linear-gradient(135deg,#4ade80,#16a34a)",
                color: "#09160d",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Save my chats
            </button>
            <button
              onClick={handleDismiss}
              className="text-[11px] px-2 py-[5px] rounded-lg border"
              style={{
                background: "transparent",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-[18px] pt-5 pb-2 flex flex-col gap-4"
        id="messages"
      >
        {messages.length === 0 && !streaming ? (
          <EmptyState onChipClick={sendMessage} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {streaming && (
              <MessageBubble
                message={{
                  role: "assistant",
                  content: streamBuffer,
                  intent: null,
                  retrievedChunks: [],
                  pillarSource: null,
                  tokensUsed: 0,
                  latencyMs: 0,
                  timestamp: new Date().toISOString(),
                }}
                streaming
                buffer={streamBuffer}
              />
            )}

            {error && (
              <div
                className="text-center text-[12.5px] px-4 py-2 rounded-lg mx-auto"
                style={{
                  background: "rgba(239,68,68,0.09)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
