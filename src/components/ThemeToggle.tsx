'use client';

import { useTheme }          from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ size = 28 }: { size?: number }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: size, height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8,
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-faint)',
        color: 'var(--txt-3)',
        cursor: 'pointer',
        fontSize: size * 0.5,
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color       = 'var(--accent)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-3)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-faint)';
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
