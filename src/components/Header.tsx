'use client';

import Image             from 'next/image';
import { useRouter }     from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth }       from '../hooks';
import ThemeToggle       from './ThemeToggle';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar:  () => void;
  onSOSClick:       () => void;
  title?:           string;
  subtitle?:        string;
  showBack?:        boolean;
}

export default function Header({
  sidebarCollapsed,
  onToggleSidebar,
  onSOSClick,
  title    = 'Amara',
  subtitle = 'Period health companion · GGCL Academy',
  showBack,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Evaluate history only on the client to avoid SSR/client mismatch
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (showBack !== undefined) {
      setCanGoBack(showBack);
    } else {
      setCanGoBack(window.history.length > 1);
    }
  }, [showBack]);

  return (
    <div
      className="flex items-center gap-3 px-[18px] py-3 flex-shrink-0"
      style={{
        background:   'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Back arrow — client-only */}
      {canGoBack && (
        <button
          onClick={() => router.back()}
          className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: 'var(--surface-input)',
            border:     '1px solid var(--border-faint)',
            color:      'var(--txt-2)',
            fontSize:   15,
          }}
          title="Go back"
        >
          ←
        </button>
      )}

      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-[13px] shrink-0 transition-colors"
        style={{
          background: 'var(--surface-input)',
          border:     '1px solid var(--border-faint)',
          color:      'var(--txt-2)',
        }}
      >
        ☰
      </button>

      {/* Logo */}
      <div
        className="w-[34px] h-[34px] rounded-full shrink-0 overflow-hidden"
        style={{ boxShadow: '0 0 12px rgba(74,222,128,0.2)' }}
      >
        <Image
          src="/Green Girl.png"
          alt="Amara"
          width={34}
          height={34}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Title */}
      <div>
        <div className="font-bold text-[14px]" style={{ color: 'var(--txt-1)' }}>{title}</div>
        <div className="flex items-center gap-1 mt-[1px]">
          <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-[10.5px]" style={{ color: 'var(--txt-4)' }}>
            {subtitle}
          </span>
        </div>
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Facilitator portal shortcut */}
      {user?.role === 'facilitator' && (
        <button
          onClick={() => router.push('/dashboard')}
          className="ml-auto px-3 py-1 rounded-2xl text-[11.5px] border transition-colors"
          style={{
            background:  'var(--surface-hover)',
            borderColor: 'var(--border)',
            color:       'var(--accent)',
          }}
        >
          🏫 Portal
        </button>
      )}

      {/* Safe space button */}
      <button
        onClick={onSOSClick}
        className={`${user?.role === 'facilitator' ? '' : 'ml-auto'} px-3 py-1 rounded-2xl text-[11.5px] border transition-colors`}
        style={{
          background:  'var(--surface-hover)',
          borderColor: 'var(--border)',
          color:       'var(--accent)',
        }}
      >
        🔒 Safe space
      </button>
    </div>
  );
}
