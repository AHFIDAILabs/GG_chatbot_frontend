'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend:    (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue]   = useState('');
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  };

  return (
    <div
      className="px-[18px] pb-[14px] pt-[10px] flex-shrink-0"
      style={{
        background:   'rgba(9,22,13,0.94)',
        borderTop:    '1px solid rgba(74,222,128,0.09)',
      }}
    >
      <div
        className="flex gap-2 items-end px-[14px] pr-[7px] py-[7px] rounded-xl transition-all duration-200"
        style={{
          background:  'rgba(255,255,255,0.04)',
          border:      '1.5px solid rgba(74,222,128,0.16)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#4ade80')}
        onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.16)')}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask Amara anything from the GGCL curriculum…"
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-[14px] resize-none leading-relaxed overflow-y-auto"
          style={{
            color:       '#e8f5ee',
            maxHeight:   110,
            fontFamily:  'DM Sans, sans-serif',
          }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-[34px] h-[34px] rounded-lg shrink-0 flex items-center justify-center text-[16px] font-black transition-all duration-150"
          style={{
            background: disabled || !value.trim()
              ? 'rgba(74,222,128,0.1)'
              : 'linear-gradient(135deg,#4ade80,#16a34a)',
            border:     'none',
            color:      disabled || !value.trim()
              ? 'rgba(74,222,128,0.28)'
              : '#09160d',
            cursor:     disabled || !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {disabled ? (
            <span
              className="block w-[12px] h-[12px] rounded-full border-2 animate-spin"
              style={{
                borderColor:      'rgba(74,222,128,0.25)',
                borderTopColor:   '#4ade80',
              }}
            />
          ) : '↑'}
        </button>
      </div>

      <p
        className="text-center mt-[6px] text-[10px]"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        Amara covers all 4 GGCL pillars · Not a doctor · Enter to send
      </p>
    </div>
  );
}