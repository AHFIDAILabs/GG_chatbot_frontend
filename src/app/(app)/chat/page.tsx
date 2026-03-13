'use client';

import { useEffect, useRef } from 'react';
import { useChat }           from '../../../hooks';
import MessageBubble         from '../../../components/MessageBubbles';
import ChatInput             from '../../../components/ChatInput';
import EmptyState            from '../../../components/EmptyState';

export default function ChatPage() {
  const {
    messages,
    streaming,
    streamBuffer,
    sendMessage,
    error,
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-[18px] pt-5 pb-2 flex flex-col gap-4"
        id="messages"
      >
        {messages.length === 0 && !streaming ? (
          <EmptyState onChipClick={handleSend} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {/* Streaming bubble */}
            {streaming && (
              <MessageBubble
                message={{
                  role:            'assistant',
                  content:         streamBuffer,
                  intent:          null,
                  retrievedChunks: [],
                  pillarSource:    null,
                  tokensUsed:      0,
                  latencyMs:       0,
                  timestamp:       new Date().toISOString(),
                }}
                streaming
                buffer={streamBuffer}
              />
            )}

            {/* Error */}
            {error && (
              <div
                className="text-center text-[12.5px] px-4 py-2 rounded-lg mx-auto"
                style={{
                  background:  'rgba(239,68,68,0.09)',
                  border:      '1px solid rgba(239,68,68,0.2)',
                  color:       '#fca5a5',
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
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  );
}