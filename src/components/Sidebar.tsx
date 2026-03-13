'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth }                from '../hooks';

const CHIPS = [
  'Why do I get cramps during my period?',
  'What are good hygiene practices during my period?',
  'What are common period myths?',
  'How do I stay safe online?',
  'How do I start saving money?',
  'What is climate change?',
  'How do I build confidence?',
];

const NAV_ITEMS = [
  { label: '💬 Chat',           href: '/chat'      },
  { label: '📖 History',        href: '/history'   },
  { label: '📚 Resources',      href: '/resources' },
  { label: '📅 Period Tracker', href: '/tracker'   },
];

interface SidebarProps {
  collapsed:   boolean;
  onChipClick: (text: string) => void;
  onSOSClick:  () => void;
}

export default function Sidebar({ collapsed, onChipClick, onSOSClick }: SidebarProps) {
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div
      className="flex-shrink-0 overflow-hidden transition-all duration-300"
      style={{ width: collapsed ? 0 : 252, background: '#0b1d0f', borderRight: '1px solid rgba(74,222,128,0.1)' }}
    >
      <div className="flex flex-col h-full" style={{ width: 252, padding: '20px 0' }}>

        {/* ── Brand ── */}
        <div className="px-4 pb-4 mb-3" style={{ borderBottom: '1px solid rgba(74,222,128,0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-black text-[19px] shrink-0"
              style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', color: '#09160d', boxShadow: '0 0 18px rgba(74,222,128,0.3)' }}
            >A</div>
            <div>
              <div className="font-bold text-[16px] text-white">Amara</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>by GGCL Academy</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 5px #4ade80' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Active · Safe space</span>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="px-2 mb-3">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-[2px] text-[13px] border transition-all duration-150"
                style={{
                  background:  active ? 'rgba(74,222,128,0.1)'  : 'transparent',
                  borderColor: active ? 'rgba(74,222,128,0.18)' : 'transparent',
                  color:       active ? '#4ade80'               : 'rgba(255,255,255,0.45)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Suggestion chips ── */}
        <div className="flex-1 px-2 overflow-y-auto">
          <div className="text-[10px] tracking-widest uppercase mb-2 pl-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Try asking
          </div>
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => onChipClick(chip)}
              className="block w-full text-left px-3 py-2 mb-[3px] rounded-[7px] text-[12px] border leading-relaxed transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background  = 'rgba(74,222,128,0.1)';
                (e.currentTarget as HTMLButtonElement).style.color       = '#fff';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,222,128,0.18)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background  = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLButtonElement).style.color       = 'rgba(255,255,255,0.5)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Bottom actions ── */}
        <div className="px-2 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(74,222,128,0.08)' }}>
          <button
            onClick={onSOSClick}
            className="w-full py-2 rounded-lg text-[12.5px] border transition-all duration-150"
            style={{ background: 'rgba(239,68,68,0.09)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontFamily: 'DM Sans, sans-serif' }}
          >
            🆘 Need urgent help?
          </button>

          {/* Logout — only shown when signed in */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-lg text-[12.5px] border transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color       = '#fff';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color       = 'rgba(255,255,255,0.4)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              👋 Sign out — {user.name.split(' ')[0]}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}