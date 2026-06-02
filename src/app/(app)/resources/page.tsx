'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import { useChat }                           from '../../../hooks';
import * as progressService                  from '../../../services/progressService';

const PILLARS = [
  {
    key:    'p1',
    icon:   '🩸',
    pillar: 'Pillar 1',
    title:  'Period & Menstrual Hygiene',
    desc:   'Your cycle, hygiene practices, emotional wellbeing and busting myths.',
    count:  '6 topics · Ages 10–18',
    badge:  'badge_menstrual_hygiene',
    sessions: [
      'What is menstruation and why does it happen?',
      'Understanding your menstrual cycle',
      'Hygiene practices during your period',
      'Managing cramps and period pain',
      'Common period myths — fact vs fiction',
      'Talking to trusted adults about your period',
    ],
  },
  {
    key:    'p2',
    icon:   '🌿',
    pillar: 'Pillar 2',
    title:  'Environmental Sustainability',
    desc:   'Climate change, recycling, waste management and eco projects.',
    count:  '6 topics · Ages 10–18',
    badge:  'badge_environment',
    sessions: [
      'What is climate change and how does it affect us?',
      'Recycling and waste reduction at home and school',
      'Sustainable living habits you can start today',
      'Water conservation in everyday life',
      'Starting an eco club or school garden',
      'How young people are leading environmental change',
    ],
  },
  {
    key:    'p3',
    icon:   '💻',
    pillar: 'Pillar 3',
    title:  'Digital & AI Skills',
    desc:   'Internet safety, documents, AI literacy and digital rights.',
    count:  '8 topics · Ages 10–18',
    badge:  'badge_digital_skills',
    sessions: [
      'Staying safe online — golden rules',
      'Understanding and avoiding cyberbullying',
      'What is artificial intelligence?',
      'Using AI tools responsibly',
      'Creating documents and presentations',
      'Evaluating online sources — spotting misinformation',
      'Your digital rights and privacy',
      'Building a positive digital footprint',
    ],
  },
  {
    key:    'p4',
    icon:   '💰',
    pillar: 'Pillar 4',
    title:  'Life Skills & Financial Literacy',
    desc:   'Confidence, communication, saving, budgeting and entrepreneurship.',
    count:  '8 topics · Ages 10–18',
    badge:  'badge_life_skills',
    sessions: [
      'Building self-confidence and self-esteem',
      'Communication and assertiveness skills',
      'Leadership and teamwork',
      'Introduction to saving money',
      'Budgeting basics',
      'Understanding needs vs wants',
      'Entrepreneurship and small business ideas',
      'Goal-setting and planning for the future',
    ],
  },
];

function topicId(pillarKey: string, session: string) {
  return `${pillarKey}::${session.slice(0, 50)}`;
}

export default function ResourcesPage() {
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const { sendMessage }                 = useChat();
  const router                          = useRouter();

  const [savedTopics,      setSavedTopics]      = useState<string[]>([]);
  const [resourcesVisited, setResourcesVisited] = useState<string[]>([]);
  const [badges,           setBadges]           = useState<string[]>([]);

  // Load progress on mount
  useEffect(() => {
    progressService.getProgress()
      .then(p => {
        setSavedTopics(p.savedTopics);
        setResourcesVisited(p.resourcesVisited);
        setBadges(p.badges);
      })
      .catch(() => null);
  }, []);

  const toggleBookmark = useCallback(async (tid: string) => {
    const isBookmarked = savedTopics.includes(tid);
    // Optimistic
    setSavedTopics(prev => isBookmarked ? prev.filter(t => t !== tid) : [...prev, tid]);
    try {
      if (isBookmarked) await progressService.removeBookmark(tid);
      else              await progressService.addBookmark(tid);
    } catch {
      setSavedTopics(prev => isBookmarked ? [...prev, tid] : prev.filter(t => t !== tid));
    }
  }, [savedTopics]);

  const handleAsk = useCallback(async (pillarKey: string, session: string) => {
    const tid = topicId(pillarKey, session);
    // Mark visited
    if (!resourcesVisited.includes(tid)) {
      setResourcesVisited(prev => [...prev, tid]);
      progressService.markVisited(tid)
        .then(d => { if (d.badges) setBadges(d.badges as unknown as string[]); })
        .catch(() => null);
    }
    sendMessage(`Tell me about: ${session}`);
    router.push('/chat');
  }, [resourcesVisited, sendMessage, router]);

  const pillar = PILLARS.find(p => p.key === activePillar);

  // Compute pillar completion %
  const pillarProgress = (p: typeof PILLARS[0]) => {
    const visited = p.sessions.filter(s => resourcesVisited.includes(topicId(p.key, s))).length;
    return { visited, total: p.sessions.length, pct: Math.round((visited / p.sessions.length) * 100) };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 22px' }}>

        {!activePillar ? (
          <>
            <div className="text-[20px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>Learning Resources</div>
            <div className="text-[12.5px] mb-2" style={{ color: 'var(--txt-4)' }}>
              Explore all four pillars of the GGCL Academy curriculum
            </div>

            {/* Badges row */}
            {badges.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {badges.map(b => (
                  <span
                    key={b}
                    className="text-[11px] px-[9px] py-[3px] rounded-full"
                    style={{ background: 'var(--accent-dim)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--accent)' }}
                  >
                    🏅 {b.replace('badge_', '').replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {PILLARS.map(p => {
                const prog    = pillarProgress(p);
                const earned  = badges.includes(p.badge);
                return (
                  <div
                    key={p.key}
                    onClick={() => setActivePillar(p.key)}
                    className="rounded-[11px] p-[18px] cursor-pointer transition-all duration-150"
                    style={{
                      background:   'var(--surface-raised)',
                      border:       `1px solid ${earned ? 'rgba(74,222,128,0.35)' : 'var(--border-faint)'}`,
                      borderRadius: 11,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = earned ? 'rgba(74,222,128,0.35)' : 'var(--border-faint)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                  >
                    <div className="flex items-center justify-between mb-[10px]">
                      <span className="text-[28px]">{p.icon}</span>
                      {earned && <span className="text-[16px]" title="Pillar complete!">🏅</span>}
                    </div>
                    <div className="text-[9.5px] tracking-[1.5px] uppercase mb-1" style={{ color: 'var(--accent)' }}>{p.pillar}</div>
                    <div className="text-[14px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>{p.title}</div>
                    <div className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--txt-3)' }}>{p.desc}</div>

                    {/* Progress bar */}
                    {prog.visited > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] mb-[3px]" style={{ color: 'var(--txt-4)' }}>
                          <span>{prog.visited}/{prog.total} explored</span>
                          <span>{prog.pct}%</span>
                        </div>
                        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border-faint)' }}>
                          <div className="h-full rounded-full" style={{ width: `${prog.pct}%`, background: 'var(--accent-gradient)' }} />
                        </div>
                      </div>
                    )}

                    <div className="text-[10.5px] pt-[9px]" style={{ color: 'rgba(74,222,128,0.55)', borderTop: '1px solid var(--border-faint)' }}>{p.count}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : pillar ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setActivePillar(null)}
                className="px-3 py-[6px] rounded-[7px] text-[12.5px]"
                style={{ background: 'var(--surface-input)', border: '1px solid var(--border-faint)', color: 'var(--txt-2)', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <div className="text-[17px] font-bold" style={{ color: 'var(--txt-1)' }}>{pillar.title}</div>
              {badges.includes(pillar.badge) && <span className="text-[18px]" title="Pillar complete!">🏅</span>}
            </div>

            {pillar.sessions.map(session => {
              const tid       = topicId(pillar.key, session);
              const visited   = resourcesVisited.includes(tid);
              const bookmarked = savedTopics.includes(tid);
              return (
                <div
                  key={session}
                  className="rounded-[10px] px-4 py-[13px] mb-2 transition-all duration-150"
                  style={{ background: 'var(--surface-raised)', border: `1px solid ${visited ? 'var(--border-strong)' : 'var(--border-faint)'}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleAsk(pillar.key, session)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {visited && <span className="text-[10px] text-green-400">✓</span>}
                        <div className="text-[13.5px] font-semibold" style={{ color: 'var(--txt-1)' }}>{session}</div>
                      </div>
                      <div className="text-[11.5px]" style={{ color: 'var(--accent)' }}>Ask Amara about this →</div>
                    </div>
                    {/* Bookmark toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(tid); }}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
                      className="shrink-0 text-[16px] transition-all duration-150 mt-[2px]"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: bookmarked ? 1 : 0.3 }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = bookmarked ? '1' : '0.3')}
                    >
                      {bookmarked ? '🔖' : '🔖'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
}
