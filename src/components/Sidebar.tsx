'use client';

import Image                          from 'next/image';
import { usePathname, useRouter }     from 'next/navigation';
import { useEffect, useState }        from 'react';
import { useAuth }                    from '../hooks';
import { onDMMessage, onDMRead }      from '../lib/socket';
import api                            from '../lib/axios';

const CHIPS = [
  'Why do I get cramps during my period?',
  'What are good hygiene practices during my period?',
  'What are common period myths?',
  'How do I stay safe online?',
  'How do I start saving money?',
  'What is climate change?',
  'How do I build confidence?',
];

const GIRL_NAV = [
  { label: '💬 Chat',           href: '/chat'        },
  { label: '📖 History',        href: '/history'     },
  { label: '📚 Resources',      href: '/resources'   },
  { label: '📅 Period Tracker', href: '/tracker'     },
  { label: '🎯 My Goals',       href: '/goals'       },
  { label: '💚 Wellbeing',      href: '/wellbeing'   },
  { label: '👩‍🏫 My Facilitator', href: '/facilitator' },
  { label: '✉️ Messages',        href: '/messages'    },
];

// Facilitators get all girl features; Messages goes to their portal inbox
const FACILITATOR_NAV = [
  { label: '💬 Chat',           href: '/chat'               },
  { label: '📖 History',        href: '/history'            },
  { label: '📚 Resources',      href: '/resources'          },
  { label: '📅 Period Tracker', href: '/tracker'            },
  { label: '🎯 My Goals',       href: '/goals'              },
  { label: '💚 Wellbeing',      href: '/wellbeing'          },
  { label: '✉️ Messages',        href: '/dashboard/messages' },
  { label: '💼 My Portal',       href: '/dashboard'          },
];

// Admins get all personal features + prominent link back to admin portal
const ADMIN_NAV = [
  { label: '🏛️ Admin Panel',    href: '/admin'     },
  { label: '💬 Chat',           href: '/chat'      },
  { label: '📖 History',        href: '/history'   },
  { label: '📚 Resources',      href: '/resources' },
  { label: '📅 Period Tracker', href: '/tracker'   },
  { label: '🎯 My Goals',       href: '/goals'     },
  { label: '💚 Wellbeing',      href: '/wellbeing' },
];

interface SidebarProps {
  collapsed:   boolean;
  onChipClick: (text: string) => void;
  onSOSClick:  () => void;
}

export default function Sidebar({ collapsed, onChipClick, onSOSClick }: SidebarProps) {
  const pathname         = usePathname();
  const router           = useRouter();
  const { user, logout } = useAuth();
  const [dmUnread, setDmUnread] = useState(0);

  const isFacilitator = user?.role === 'facilitator';
  const isAdmin       = user?.role === 'admin';
  const messagesHref  = isFacilitator ? '/dashboard/messages' : '/messages';

  // Load initial unread count (admins have no DM thread)
  useEffect(() => {
    if (!user || isAdmin) return;
    if (isFacilitator) {
      api.get<{ success: true; data: { totalUnread: number } }>('/facilitator/messages')
        .then(({ data }) => setDmUnread(data.data.totalUnread))
        .catch(() => {});
    } else if (user.facilitatorId) {
      api.get<{ success: true; data: { thread: { girlUnread: number } } }>('/messages')
        .then(({ data }) => setDmUnread(data.data.thread.girlUnread))
        .catch(() => {});
    }
  }, [user, isFacilitator, isAdmin]);

  // Real-time badge updates
  useEffect(() => {
    const offMsg = onDMMessage(() => {
      if (pathname !== messagesHref) setDmUnread(n => n + 1);
    });
    const offRead = onDMRead(({ by }) => {
      // For girls: facilitator read their messages → clear badge
      // For facilitators: girl read → decrement
      if (!isFacilitator) setDmUnread(0);
      else if (by === 'girl') setDmUnread(n => Math.max(0, n - 1));
    });
    return () => { offMsg(); offRead(); };
  }, [pathname, messagesHref, isFacilitator]);

  // Clear badge when on the messages page
  useEffect(() => {
    if (pathname === messagesHref || pathname.startsWith(messagesHref + '/')) {
      setDmUnread(0);
    }
  }, [pathname, messagesHref]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = isAdmin ? ADMIN_NAV : isFacilitator ? FACILITATOR_NAV : GIRL_NAV;

  return (
    <div
      className="flex-shrink-0 overflow-hidden transition-all duration-300"
      style={{ width: collapsed ? 0 : 252, background: 'var(--surface)', borderRight: '1px solid var(--border-faint)' }}
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
              <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>by GGCL Academy</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 5px #4ade80' }} />
            <span className="text-[11px]" style={{ color: 'var(--txt-4)' }}>Active · Safe space</span>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="px-2 mb-3">
          {navItems.map(item => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            const badge  = item.href === messagesHref && dmUnread > 0 ? dmUnread : 0;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg mb-[2px] text-[13px] border transition-all duration-150"
                style={{
                  background:  active ? 'var(--surface-active)'  : 'transparent',
                  borderColor: active ? 'var(--border-input)' : 'transparent',
                  color:       active ? 'var(--accent)'               : 'var(--txt-3)',
                }}
              >
                <span>{item.label}</span>
                {badge > 0 && (
                  <span
                    className="text-[10px] font-bold px-[6px] py-[1px] rounded-full"
                    style={{ background: 'var(--accent)', color: '#ffffff', minWidth: 18, textAlign: 'center' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Suggestion chips ── */}
        <div className="flex-1 px-2 overflow-y-auto">
          <div className="text-[10px] tracking-widest uppercase mb-2 pl-1" style={{ color: 'var(--txt-5)' }}>
            Try asking
          </div>
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => onChipClick(chip)}
              className="block w-full text-left px-3 py-2 mb-[3px] rounded-[7px] text-[12px] border leading-relaxed transition-all duration-150"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-faint)', color: 'var(--txt-3)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background  = 'var(--surface-hover)';
                (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-input)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background  = 'var(--surface-raised)';
                (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-3)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-faint)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Facilitator chip (girls only, when assigned) ── */}
        {user?.role === 'girl' && user?.facilitatorName && (
          <div className="px-2 mb-2">
            <button
              onClick={() => router.push('/messages')}
              className="w-full px-3 py-2 rounded-lg text-left text-[11.5px] border transition-all"
              style={{ background: 'var(--surface-hover)', borderColor: 'var(--accent-dim)', color: 'var(--txt-3)', fontFamily: 'DM Sans, sans-serif' }}
            >
              <span style={{ color: 'var(--txt-5)' }}>Facilitator: </span>
              <span style={{ color: 'var(--accent)' }}>{user.facilitatorName}</span>
            </button>
          </div>
        )}

        {/* ── Bottom actions ── */}
        <div className="px-2 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onSOSClick}
            className="w-full py-2 rounded-lg text-[12.5px] border transition-all duration-150"
            style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger-txt)', fontFamily: 'DM Sans, sans-serif' }}
          >
            🆘 Need urgent help?
          </button>

          {user && (
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
              👋 Sign out — {user.name.split(' ')[0]}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
