'use client';

import { useState, useRef, KeyboardEvent, useEffect, useCallback } from 'react';

// Minimal Speech Recognition interfaces — not universally available in TS lib
interface SpeechRecognitionAlternative { transcript: string }
interface SpeechRecognitionResultItem  { [index: number]: SpeechRecognitionAlternative }
interface SpeechRecognitionResultList  { [index: number]: SpeechRecognitionResultItem; length: number }
interface SpeechRecognitionResultEvent { results: SpeechRecognitionResultList }

interface SpeechRecognitionInstance extends EventTarget {
  continuous:     boolean;
  interimResults: boolean;
  lang:           string;
  start():  void;
  stop():   void;
  onstart:  ((e: Event) => void) | null;
  onend:    ((e: Event) => void) | null;
  onerror:  ((e: Event) => void) | null;
  onresult: ((e: SpeechRecognitionResultEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition:       { new(): SpeechRecognitionInstance } | undefined;
    webkitSpeechRecognition: { new(): SpeechRecognitionInstance } | undefined;
  }
}

interface ChatInputProps {
  onSend:    (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value,       setValue]       = useState('');
  const [listening,   setListening]   = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognizerRef = useRef<SpeechRecognitionInstance | null>(null);

  // Detect Web Speech API support on mount (client only)
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SR));
  }, []);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    recognizerRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = 'en-NG'; // Nigerian English; falls back to en

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);

    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setValue(transcript);
      // Auto-resize
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 110) + 'px';
      }
    };

    recognizerRef.current = rec;
    rec.start();
  }, []);

  const toggleVoice = useCallback(() => {
    if (listening) stopListening();
    else           startListening();
  }, [listening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => () => stopListening(), [stopListening]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    stopListening();
    onSend(trimmed);
    setValue('');
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
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="flex gap-2 items-end px-[14px] pr-[7px] py-[7px] rounded-xl transition-all duration-200"
        style={{ background: 'var(--surface-input)', border: `1.5px solid ${listening ? 'var(--accent)' : 'var(--border-input)'}` }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlur={e  => { if (!listening) e.currentTarget.style.borderColor = 'var(--border-input)'; }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={listening ? 'Listening…' : 'Ask Amara anything from the GGCL curriculum…'}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-[14px] resize-none leading-relaxed overflow-y-auto"
          style={{ color: 'var(--txt-1)', maxHeight: 110, fontFamily: 'DM Sans, sans-serif' }}
        />

        {/* Voice button — only rendered when supported */}
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            disabled={disabled}
            title={listening ? 'Stop listening' : 'Voice input'}
            className="w-[34px] h-[34px] rounded-lg shrink-0 flex items-center justify-center text-[15px] transition-all duration-150"
            style={{
              background: listening ? 'var(--accent-dim)'    : 'var(--surface-raised)',
              border:     listening ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
              color:      listening ? 'var(--accent)'         : 'var(--txt-3)',
              cursor:     disabled ? 'not-allowed' : 'pointer',
              animation:  listening ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }}
          >
            {listening ? '⏹' : '🎤'}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-[34px] h-[34px] rounded-lg shrink-0 flex items-center justify-center text-[16px] font-black transition-all duration-150"
          style={{
            background: disabled || !value.trim()
              ? 'var(--accent-dim)'
              : 'var(--accent-gradient)',
            border:  'none',
            color:   disabled || !value.trim() ? 'var(--txt-4)' : '#ffffff',
            cursor:  disabled || !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {disabled ? (
            <span
              className="block w-[12px] h-[12px] rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
            />
          ) : '↑'}
        </button>
      </div>

      <p className="text-center mt-[6px] text-[10px]" style={{ color: 'var(--txt-4)' }}>
        Amara covers all 4 GGCL pillars · Not a doctor · Enter to send
      </p>
    </div>
  );
}
