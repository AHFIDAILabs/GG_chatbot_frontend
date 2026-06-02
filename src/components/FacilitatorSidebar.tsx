'use client';

import Image                      from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState }    from 'react';
import { useAuth }                from '../hooks';
import { onDMMessage, onDMRead }  from '../lib/socket';
import api                        from '../lib/axios';

const PORTAL_NAV = [
  { label: '🚨 Flagged Alerts', href: '/dashboard'          },
  { label: '👩‍🎓 My Girls',       href: '/dashboard/girls'    },
  { label: '✉️ Messages',        href: '/dashboard/messages' },
  { label: '⚙️ Settings',        href: '/dashboard/settings' },
];

const PERSONAL_NAV = [
  { label: '💬 Chat',           href: '/chat'      },
  { label: '📖 History',        href: '/history'   },
  { label: '📚 Resources',      href: '/resources' },
  { label: '📅 Period Tracker', href: '/tracker'   },
  { label: '🎯 My Goals',       href: '/goals'     },
  { label: '💚 Wellbeing',      href: '/wellbeing' },
];

interface FacilitatorSidebarProps {
  collapsed: boolean;
}

export default function FacilitatorSidebar({ collapsed }: FacilitatorSidebarProps) {
  const pathname         = usePathname();
  const router           = useRouter();
  const { user, logout } = useAuth();
  const [dmUnread, setDmUnread] = useState(0);

  useEffect(() => {
    if (user?.role !== 'facilitator') return;
    api.get<{ success: true; data: { totalUnread: number } }>('/facilitator/messages')
      .then(({ data }) => setDmUnread(data.data.totalUnread))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const offMsg = onDMMessage(() => {
      if (!pathname.startsWith('/dashboard/messages/')) setDmUnread(n => n + 1);
    });
    const offRead = onDMRead(({ by }) => {
      if (by === 'girl') setDmUnread(n => Math.max(0, n - 1));
    });
    return () => { offMsg(); offRead(); };
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/messages')) setDmUnread(0);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(href + '/');

  const navBtn = (item: { label: string; href: string }, badge = 0) => {
    const active = isActive(item.href);
    return (
      <button
        key={item.href}
        onClick={() => router.push(item.href)}
        className="flex items-center justify-between w-full text-left px-3 py-[9px] rounded-lg mb-[2px] text-[13px] border transition-all duration-150"
        style={{
          background:  active ? 'var(--surface-active)' : 'transparent',
          borderColor: active ? 'var(--border-input)'   : 'transparent',
          color:       active ? 'var(--accent)'          : 'var(--txt-3)',
        }}
      >
        <span>{item.label}</span>
        {badge > 0 && (
          <span
            className="text-[10px] font-bold px-[6px] py-[1px] rounded-full"
            style={{ background: 'var(--accent)', color: '#09160d', minWidth: 18, textAlign: 'center' }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="flex-shrink-0 overflow-hidden transition-all duration-300"
      style={{ width: collapsed ? 0 : 252, background: 'var(--surface-alt)', borderRight: '1px solid var(--border-faint)' }}
    >
      <div className="flex flex-col h-full" style={{ width: 252, padding: '20px 0' }}>

        {/* ── Brand ── */}
        <div className="px-4 pb-4 mb-3" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-[42px] h-[42px] rounded-full shrink-0 overflow-hidden"
              style={{ boxShadow: '0 0 18px rgba(74,222,128,0.3)' }}
            >
              <Image src="/Green Girl.png" alt="Amara" width={42} height={42} className="w-full h-full object-cover" priority />
            </div>
            <div>
              <div className="font-bold text-[16px]" style={{ color: 'var(--txt-1)' }}>Amara</div>
              <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>Facilitator Portal</div>
            </div>
          </div>

          {user && (
            <div
              className="mt-2 px-3 py-[6px] rounded-[8px] text-[11.5px]"
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--accent-dim)' }}
            >
              <div className="font-medium truncate" style={{ color: 'var(--txt-1)' }}>{user.name}</div>
              {user.groupCode && (
                <div className="flex items-center gap-1 mt-[3px]">
                  <span style={{ color: 'var(--txt-4)' }}>Code:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.08em' }}>
                    {user.groupCode}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Scrollable nav area ── */}
        <div className="flex-1 overflow-y-auto px-2">

          {/* Portal section */}
          <div className="text-[9.5px] tracking-widest uppercase pl-1 mb-1" style={{ color: 'var(--txt-5)' }}>
            Portal
          </div>
          <nav className="mb-3">
            {PORTAL_NAV.map(item =>
              navBtn(item, item.href === '/dashboard/messages' ? dmUnread : 0),
            )}
          </nav>

          {/* Divider */}
          <div className="my-2 mx-1" style={{ borderTop: '1px solid var(--border-faint)' }} />

          {/* Personal section */}
          <div className="text-[9.5px] tracking-widest uppercase pl-1 mb-1 mt-2" style={{ color: 'var(--txt-5)' }}>
            For You
          </div>
          <nav>
            {PERSONAL_NAV.map(item => navBtn(item))}
          </nav>
        </div>

        {/* ── Bottom ── */}
        <div className="px-2 pt-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg text-[12.5px] border transition-all duration-150"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-faint)', color: 'var(--txt-3)', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-1)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-input)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-3)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-faint)';
            }}
          >
            👋 Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
