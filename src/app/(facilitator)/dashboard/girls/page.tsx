'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import api                                   from '../../../../lib/axios';

interface Girl {
  _id:              string;
  name:             string;
  email:            string;
  ageGroup:         '10-13' | '14-18' | null;
  badges:           string[];
  savedTopics:      string[];
  resourcesVisited: string[];
  lastLoginAt:      string | null;
  createdAt:        string;
}

interface GirlProgress extends Girl {
  flaggedConversations: number;
}

const BADGE_LABEL: Record<string, string> = {
  first_chat:       'First Chat',
  goal_setter:      'Goal Setter',
  tracker_starter:  'Tracker Starter',
  week_streak:      '7-Day Streak',
  period_pro:       'Period Pro',
};

async function fetchGirls(page: number) {
  const { data } = await api.get<{
    success: true;
    data: { girls: Girl[]; total: number; totalPages: number };
  }>(`/facilitator/girls?page=${page}&limit=50`);
  return data.data;
}

async function fetchProgress(girlId: string) {
  const { data } = await api.get<{
    success: true;
    data: { girl: GirlProgress };
  }>(`/facilitator/girls/${girlId}/progress`);
  return data.data.girl;
}

export default function GirlsPage() {
  const router = useRouter();
  const [girls,    setGirls]    = useState<Girl[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<GirlProgress | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchGirls(1);
      setGirls(d.girls);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectGirl = async (girl: Girl) => {
    setDetailLoading(true);
    try {
      const progress = await fetchProgress(girl._id);
      setSelected(progress);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = girls.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: girls list ── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 300, borderColor: 'var(--border)' }}>

        {/* Search + count */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--txt-4)' }}>
              My Girls
            </span>
            <span className="text-[11px] px-2 py-[2px] rounded-full" style={{ background: 'var(--border)', color: 'var(--accent)' }}>
              {total}
            </span>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent text-[12px] outline-none px-3 py-[7px] rounded-[7px]"
            style={{
              border: '1px solid var(--border-faint)',
              color: 'var(--txt-2)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-[12px]" style={{ color: 'var(--txt-4)' }}>
              {total === 0 ? 'No girls have joined your cohort yet' : 'No results'}
            </div>
          ) : (
            filtered.map(g => (
              <div
                key={g._id}
                onClick={() => selectGirl(g)}
                className="px-4 py-3 cursor-pointer border-b transition-colors"
                style={{
                  borderColor: 'var(--border-faint)',
                  background:  selected?._id === g._id ? 'var(--surface-hover)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-[3px]">
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                  >
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate" style={{ color: 'var(--txt-1)' }}>{g.name}</div>
                    <div className="text-[10.5px] truncate" style={{ color: 'var(--txt-4)' }}>{g.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-[5px]">
                  {g.ageGroup && (
                    <span className="text-[9.5px] px-[5px] py-[1px] rounded-full" style={{ background: 'var(--surface-hover)', color: 'rgba(74,222,128,0.6)' }}>
                      {g.ageGroup}
                    </span>
                  )}
                  {g.badges.length > 0 && (
                    <span className="text-[9.5px]" style={{ color: 'var(--txt-4)' }}>
                      {g.badges.length} badge{g.badges.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {g.lastLoginAt && (
                    <span className="text-[9.5px] ml-auto" style={{ color: 'var(--txt-5)' }}>
                      {new Date(g.lastLoginAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {detailLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[12px]" style={{ color: 'var(--txt-4)' }}>Loading…</div>
          </div>
        ) : !selected ? (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <div className="text-[32px]">👩‍🎓</div>
            <div className="text-[13px]" style={{ color: 'var(--txt-4)' }}>Select a girl to view her progress</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">

            {/* Profile header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px] font-bold shrink-0"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', boxShadow: '0 0 20px rgba(74,222,128,0.1)' }}
              >
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[16px] font-bold" style={{ color: 'var(--txt-1)' }}>{selected.name}</div>
                <div className="text-[12px] mt-[2px]" style={{ color: 'var(--txt-3)' }}>{selected.email}</div>
                <div className="flex items-center gap-2 mt-[5px]">
                  {selected.ageGroup && (
                    <span className="text-[10.5px] px-[7px] py-[2px] rounded-full" style={{ background: 'var(--border)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
                      Age {selected.ageGroup}
                    </span>
                  )}
                  {selected.flaggedConversations > 0 && (
                    <span className="text-[10.5px] px-[7px] py-[2px] rounded-full" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-txt)' }}>
                      {selected.flaggedConversations} flagged
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat button */}
            <button
              onClick={() => router.push(`/dashboard/messages/${selected._id}`)}
              className="flex items-center gap-2 px-4 py-[9px] rounded-[9px] text-[12.5px] font-medium mb-6 border transition-all"
              style={{ background: 'var(--surface-active)', borderColor: 'var(--border-strong)', color: 'var(--accent)', cursor: 'pointer' }}
            >
              ✉️ Open Chat
            </button>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Badges earned',      value: selected.badges.length },
                { label: 'Topics explored',    value: selected.savedTopics.length },
                { label: 'Resources visited',  value: selected.resourcesVisited.length },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-[10px] p-4 text-center"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}
                >
                  <div className="text-[22px] font-bold" style={{ color: 'var(--txt-1)' }}>{stat.value}</div>
                  <div className="text-[10.5px] mt-1" style={{ color: 'var(--txt-4)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            {selected.badges.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--txt-4)' }}>Badges</div>
                <div className="flex flex-wrap gap-2">
                  {selected.badges.map(badge => (
                    <span
                      key={badge}
                      className="text-[11px] px-3 py-1 rounded-full"
                      style={{ background: 'var(--border)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}
                    >
                      {BADGE_LABEL[badge] ?? badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Saved topics */}
            {selected.savedTopics.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--txt-4)' }}>Saved Topics</div>
                <div className="flex flex-wrap gap-2">
                  {selected.savedTopics.map(t => (
                    <span
                      key={t}
                      className="text-[11px] px-3 py-1 rounded-full"
                      style={{ background: 'var(--surface-input)', border: '1px solid var(--border-faint)', color: 'var(--txt-2)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="rounded-[10px] p-4" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}>
              <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--txt-4)' }}>Activity</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--txt-3)' }}>Last active</span>
                  <span style={{ color: 'var(--txt-2)' }}>
                    {selected.lastLoginAt
                      ? new Date(selected.lastLoginAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Never logged in'}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--txt-3)' }}>Joined</span>
                  <span style={{ color: 'var(--txt-2)' }}>
                    {new Date(selected.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
