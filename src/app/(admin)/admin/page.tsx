'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams }        from 'next/navigation';
import api                                   from '../../../lib/axios';
import { useAuth }                           from '../../../hooks';

interface Invite {
  _id:       string;
  token:     string;
  inviteUrl: string;
  note:      string;
  expiresAt: string;
  used:      boolean;
  usedBy:    { name: string; email: string } | null;
  createdAt: string;
}

interface Facilitator {
  _id:         string;
  name:        string;
  email:       string;
  groupCode:   string | null;
  girlCount:   number;
  lastLoginAt: string | null;
  isActive:    boolean;
}

interface UnassignedGirl {
  _id:         string;
  name:        string;
  email:       string;
  ageGroup:    string | null;
  lastLoginAt: string | null;
  createdAt:   string;
}

interface Stats {
  girls:          number;
  facilitators:   number;
  pendingInvites: number;
  unassigned:     number;
}

type Tab = 'invites' | 'facilitators' | 'unassigned';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return (t === 'facilitators' || t === 'unassigned') ? t : 'invites';
  });
  const [invites,         setInvites]         = useState<Invite[]>([]);
  const [facilitators,    setFacilitators]    = useState<Facilitator[]>([]);
  const [unassignedGirls, setUnassignedGirls] = useState<UnassignedGirl[]>([]);
  const [stats,           setStats]           = useState<Stats | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [assigning,       setAssigning]       = useState<string | null>(null);
  const [assignTarget,    setAssignTarget]    = useState<Record<string, string>>({});
  const [note,          setNote]          = useState('');
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [generating,    setGenerating]    = useState(false);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [revoking,      setRevoking]      = useState<string | null>(null);

  const { logout } = useAuth();
  const router     = useRouter();

  const switchTab = (t: Tab) => {
    setTab(t);
    router.replace(`/admin?tab=${t}`, { scroll: false });
  };

  // Keep tab in sync if sidebar navigation changes the URL
  useEffect(() => {
    const t = searchParams.get('tab');
    const resolved: Tab = (t === 'facilitators' || t === 'unassigned') ? t : 'invites';
    setTab(resolved);
  }, [searchParams]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, facRes, statsRes, unassRes] = await Promise.all([
        api.get<{ success: true; data: { invites: Invite[] } }>('/admin/invites'),
        api.get<{ success: true; data: { facilitators: Facilitator[] } }>('/admin/facilitators'),
        api.get<{ success: true; data: Stats }>('/admin/stats'),
        api.get<{ success: true; data: { girls: UnassignedGirl[] } }>('/admin/girls/unassigned'),
      ]);
      setInvites(invRes.data.data.invites);
      setFacilitators(facRes.data.data.facilitators);
      setStats(statsRes.data.data);
      setUnassignedGirls(unassRes.data.data.girls);
    } finally {
      setLoading(false);
    }
  }, []);

  const assignToFacilitator = async (girlId: string) => {
    const facilitatorId = assignTarget[girlId];
    if (!facilitatorId) return;
    setAssigning(girlId);
    try {
      await api.patch(`/admin/girls/${girlId}/assign`, { facilitatorId });
      setUnassignedGirls(prev => prev.filter(g => g._id !== girlId));
      setStats(prev => prev ? { ...prev, unassigned: Math.max(0, prev.unassigned - 1) } : prev);
      setFacilitators(prev => prev.map(f =>
        f._id === facilitatorId ? { ...f, girlCount: f.girlCount + 1 } : f,
      ));
      setAssignTarget(prev => { const n = { ...prev }; delete n[girlId]; return n; });
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Assignment failed');
    } finally {
      setAssigning(null);
    }
  };

  useEffect(() => { loadAll(); }, [loadAll]);

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post<{ success: true; data: Invite }>('/admin/invites', {
        note:           note.trim() || undefined,
        expiresInHours,
      });
      setInvites(prev => [data.data, ...prev]);
      setStats(prev => prev ? { ...prev, pendingInvites: prev.pendingInvites + 1 } : prev);
      setNote('');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async (invite: Invite) => {
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopiedId(invite._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      await api.delete(`/admin/invites/${id}`);
      setInvites(prev => prev.filter(i => i._id !== id));
      setStats(prev => prev ? { ...prev, pendingInvites: Math.max(0, prev.pendingInvites - 1) } : prev);
    } finally {
      setRevoking(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const statCard = (label: string, value: number | undefined, color: string) => (
    <div
      className="flex-1 rounded-[12px] p-4 text-center"
      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}
    >
      <div className="text-[26px] font-bold" style={{ color }}>{value ?? '—'}</div>
      <div className="text-[11px] mt-1" style={{ color: 'var(--txt-4)' }}>{label}</div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 max-w-[760px] mx-auto">

      {/* Stats row */}
      <div className="flex gap-3 mb-6">
        {statCard('Girls',        stats?.girls,          '#4ade80')}
        {statCard('Facilitators', stats?.facilitators,   '#60a5fa')}
        {statCard('Open invites', stats?.pendingInvites, '#fbbf24')}
        {statCard('Unassigned',   stats?.unassigned,     stats?.unassigned ? '#fca5a5' : '#4ade80')}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 p-1 rounded-[10px]" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)', width: 'fit-content' }}>
        {(['invites', 'facilitators', 'unassigned'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className="px-4 py-[6px] rounded-[7px] text-[12.5px] transition-all capitalize"
            style={{
              background:  tab === t ? 'var(--surface-active)'  : 'transparent',
              border:      tab === t ? '1px solid var(--border-strong)' : '1px solid transparent',
              color:       tab === t ? 'var(--accent)' : 'var(--txt-3)',
              cursor:      'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[12px]" style={{ color: 'var(--txt-4)' }}>Loading…</div>
      ) : tab === 'invites' ? (
        <>
          {/* Generate form */}
          <div
            className="rounded-[14px] p-5 mb-5"
            style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-faint)' }}
          >
            <div className="text-[12px] font-semibold mb-3" style={{ color: 'var(--txt-1)' }}>Generate invite link</div>
            <div className="flex gap-3 mb-3">
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note (e.g. 'Kano cohort — June 2025')"
                className="flex-1 bg-transparent text-[12.5px] outline-none px-3 py-[8px] rounded-[8px]"
                style={{ border: '1px solid var(--border-faint)', color: 'var(--txt-2)', fontFamily: 'DM Sans, sans-serif' }}
              />
              <select
                value={expiresInHours}
                onChange={e => setExpiresInHours(Number(e.target.value))}
                className="bg-transparent text-[12px] outline-none px-3 py-[8px] rounded-[8px]"
                style={{ border: '1px solid var(--border-faint)', color: 'var(--txt-2)', fontFamily: 'DM Sans, sans-serif', background: 'var(--surface-input)' }}
              >
                <option value={24}>24 h</option>
                <option value={48}>48 h</option>
                <option value={72}>72 h</option>
                <option value={168}>7 days</option>
              </select>
            </div>
            <button
              onClick={generateInvite}
              disabled={generating}
              className="px-5 py-[8px] rounded-[8px] text-[12.5px] font-medium transition-opacity"
              style={{
                background: 'var(--accent-gradient)',
                color: '#09160d', border: 'none',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.6 : 1,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {generating ? 'Generating…' : '+ Generate invite'}
            </button>
          </div>

          {/* Invite list */}
          {invites.length === 0 ? (
            <div className="text-center py-8 text-[12px]" style={{ color: 'var(--txt-4)' }}>No invites yet</div>
          ) : (
            invites.map(inv => {
              const expired = new Date(inv.expiresAt) < new Date();
              return (
                <div
                  key={inv._id}
                  className="rounded-[12px] p-4 mb-3"
                  style={{
                    background: inv.used ? 'var(--surface-raised)' : 'var(--surface-raised)',
                    border: `1px solid ${inv.used ? 'var(--border-faint)' : expired ? 'var(--danger-border)' : 'var(--border-faint)'}`,
                    opacity: inv.used ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9.5px] px-[6px] py-[1px] rounded-full"
                          style={{
                            background: inv.used ? 'var(--surface-input)' : expired ? 'var(--danger-bg)' : 'var(--border)',
                            color:      inv.used ? 'var(--txt-4)' : expired ? 'var(--danger-txt)' : 'var(--accent)',
                          }}
                        >
                          {inv.used ? 'used' : expired ? 'expired' : 'active'}
                        </span>
                        {inv.note && (
                          <span className="text-[11.5px] truncate" style={{ color: 'var(--txt-1)' }}>{inv.note}</span>
                        )}
                      </div>
                      <div
                        className="text-[10.5px] font-mono truncate mb-1"
                        style={{ color: 'var(--txt-4)' }}
                      >
                        {inv.inviteUrl}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--txt-4)' }}>
                        {inv.used && inv.usedBy
                          ? `Used by ${inv.usedBy.name} (${inv.usedBy.email})`
                          : `Expires ${new Date(inv.expiresAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                        }
                      </div>
                    </div>

                    {!inv.used && !expired && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => copyLink(inv)}
                          className="px-3 py-[5px] rounded-[6px] text-[11px] transition-all"
                          style={{
                            background:  copiedId === inv._id ? 'var(--accent-dim)' : 'var(--surface-input)',
                            border:      copiedId === inv._id ? '1px solid rgba(74,222,128,0.25)' : '1px solid var(--border-faint)',
                            color:       copiedId === inv._id ? 'var(--accent)' : 'var(--txt-2)',
                            cursor:      'pointer',
                          }}
                        >
                          {copiedId === inv._id ? '✓ Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => revoke(inv._id)}
                          disabled={revoking === inv._id}
                          className="px-3 py-[5px] rounded-[6px] text-[11px] transition-all"
                          style={{
                            background:  'var(--danger-bg)',
                            border:      '1px solid var(--danger-border)',
                            color:       'var(--danger-txt)',
                            cursor:      revoking === inv._id ? 'not-allowed' : 'pointer',
                            opacity:     revoking === inv._id ? 0.5 : 1,
                          }}
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : tab === 'facilitators' ? (
        /* Facilitators tab */
        facilitators.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--txt-4)' }}>No facilitators yet</div>
        ) : (
          facilitators.map(f => (
            <div
              key={f._id}
              className="rounded-[12px] p-4 mb-3"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium" style={{ color: 'var(--txt-1)' }}>{f.name}</div>
                  <div className="text-[11px] mt-[2px]" style={{ color: 'var(--txt-3)' }}>{f.email}</div>
                  {f.groupCode && (
                    <div className="flex items-center gap-1 mt-[4px]">
                      <span className="text-[10px]" style={{ color: 'var(--txt-4)' }}>Code:</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--accent)' }}>{f.groupCode}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-bold" style={{ color: '#60a5fa' }}>{f.girlCount}</div>
                  <div className="text-[10px]" style={{ color: 'var(--txt-4)' }}>girls</div>
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        /* Unassigned girls tab */
        unassignedGirls.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--txt-4)' }}>
            All girls are assigned to a facilitator
          </div>
        ) : (
          unassignedGirls.map(g => (
            <div
              key={g._id}
              className="rounded-[12px] p-4 mb-3"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-[14px] shrink-0"
                  style={{ background: 'var(--surface-active)', color: 'var(--accent)' }}
                >
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium truncate" style={{ color: 'var(--txt-1)' }}>{g.name}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--txt-4)' }}>{g.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={assignTarget[g._id] ?? ''}
                    onChange={e => setAssignTarget(prev => ({ ...prev, [g._id]: e.target.value }))}
                    className="text-[11px] outline-none px-2 py-[5px] rounded-[6px]"
                    style={{
                      border: '1px solid var(--border-faint)',
                      background: 'var(--surface-input)',
                      color: 'var(--txt-2)',
                      fontFamily: 'DM Sans, sans-serif',
                      maxWidth: 160,
                    }}
                  >
                    <option value="" disabled>Select facilitator…</option>
                    {facilitators.map(f => (
                      <option key={f._id} value={f._id}
                        style={{ background: '#0b1d0f', color: '#e8f5ee' }}>
                        {f.name}{f.groupCode ? ` · ${f.groupCode}` : ''} ({f.girlCount})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignToFacilitator(g._id)}
                    disabled={assigning === g._id || !assignTarget[g._id]}
                    className="px-3 py-[5px] rounded-[6px] text-[11px] transition-all"
                    style={{
                      background: 'var(--border)',
                      border:     '1px solid var(--border-strong)',
                      color:      'var(--accent)',
                      cursor:     assigning === g._id || !assignTarget[g._id] ? 'not-allowed' : 'pointer',
                      opacity:    assigning === g._id || !assignTarget[g._id] ? 0.5 : 1,
                    }}
                  >
                    {assigning === g._id ? '…' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )
      )}

      {/* Sign out */}
      <div className="mt-8 pt-5" style={{ borderTop: '1px solid var(--border-faint)' }}>
        <button
          onClick={handleLogout}
          className="text-[12px] transition-colors"
          style={{ background: 'none', border: 'none', color: 'var(--txt-4)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          👋 Sign out
        </button>
      </div>
    </div>
  );
}
