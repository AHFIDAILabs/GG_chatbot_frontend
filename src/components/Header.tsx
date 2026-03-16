'use client';

import Image            from 'next/image';
import { useRouter }    from 'next/navigation';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar:  () => void;
  onSOSClick:       () => void;
  title?:           string;
  subtitle?:        string;
  showBack?:        boolean;  // optional — defaults to true when history exists
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

  const handleBack = () => router.back();

  // Show back arrow if explicitly set, or if browser has history to go back to
  const canGoBack = showBack ?? (typeof window !== 'undefined' && window.history.length > 1);

  return (
    <div
      className="flex items-center gap-3 px-[18px] py-3 flex-shrink-0"
      style={{
        background:   'rgba(9,22,13,0.94)',
        borderBottom: '1px solid rgba(74,222,128,0.09)',
      }}
    >
      {/* Back arrow */}
      {canGoBack && (
        <button
          onClick={handleBack}
          className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid rgba(255,255,255,0.09)',
            color:      'rgba(255,255,255,0.55)',
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
          background: 'rgba(255,255,255,0.05)',
          border:     '1px solid rgba(255,255,255,0.09)',
          color:      'rgba(255,255,255,0.55)',
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
        <div className="font-bold text-[14px] text-white">{title}</div>
        <div className="flex items-center gap-1 mt-[1px]">
          <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#4ade80' }} />
          <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {subtitle}
          </span>
        </div>
      </div>

      {/* Safe space button */}
      <button
        onClick={onSOSClick}
        className="ml-auto px-3 py-1 rounded-2xl text-[11.5px] border transition-colors"
        style={{
          background:  'rgba(74,222,128,0.07)',
          borderColor: 'rgba(74,222,128,0.16)',
          color:       '#4ade80',
        }}
      >
        🔒 Safe space
      </button>
    </div>
  );
}