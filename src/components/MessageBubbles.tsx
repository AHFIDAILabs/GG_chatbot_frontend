'use client';

import { renderMarkdown } from '../lib/tracker';
import { Message }        from '../types';

interface MessageBubbleProps {
  message:   Message;
  streaming?: boolean;   // true only on the last assistant bubble while streaming
  buffer?:   string;     // streamed content so far
}

export default function MessageBubble({ message, streaming, buffer }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const content = streaming ? buffer ?? '' : message.content;

  return (
    <div
      className={`flex items-end gap-2 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-[31px] h-[31px] rounded-full shrink-0 flex items-center justify-center text-[14px]"
        style={
          isUser
            ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.3)' }
            : { background: 'var(--accent-gradient)' }
        }
      >
        {isUser ? '👤' : '🌸'}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[68%] px-[15px] py-[11px] text-[14px] leading-relaxed"
        style={
          isUser
            ? {
                borderRadius: '15px 15px 3px 15px',
                background:   'var(--accent-gradient)',
                border:       '1px solid var(--border)',
                color:        '#ffffff',
                boxShadow:    '0 2px 12px rgba(0,0,0,0.15)',
              }
            : {
                borderRadius: '15px 15px 15px 3px',
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                color:        'var(--txt-1)',
                boxShadow:    '0 2px 8px rgba(0,0,0,0.07)',
              }
        }
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            {streaming && (
              <span
                className="inline-block w-[2px] h-[14px] ml-[2px] align-middle animate-blink"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
