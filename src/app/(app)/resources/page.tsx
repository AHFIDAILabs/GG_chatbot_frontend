'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat }   from '../../../hooks';

const PILLARS = [
  {
    key:      'p1',
    icon:     '🩸',
    pillar:   'Pillar 1',
    title:    'Period & Menstrual Hygiene',
    desc:     'Your cycle, hygiene practices, emotional wellbeing and busting myths.',
    count:    '6 topics · Ages 10–18',
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
    key:      'p2',
    icon:     '🌿',
    pillar:   'Pillar 2',
    title:    'Environmental Sustainability',
    desc:     'Climate change, recycling, waste management and eco projects.',
    count:    '6 topics · Ages 10–18',
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
    key:      'p3',
    icon:     '💻',
    pillar:   'Pillar 3',
    title:    'Digital & AI Skills',
    desc:     'Internet safety, documents, AI literacy and digital rights.',
    count:    '8 topics · Ages 10–18',
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
    key:      'p4',
    icon:     '💰',
    pillar:   'Pillar 4',
    title:    'Life Skills & Financial Literacy',
    desc:     'Confidence, communication, saving, budgeting and entrepreneurship.',
    count:    '8 topics · Ages 10–18',
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

export default function ResourcesPage() {
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const { sendMessage }                 = useChat();
  const router                          = useRouter();

  const pillar = PILLARS.find(p => p.key === activePillar);

  const handleAsk = (session: string) => {
    sendMessage(`Tell me about: ${session}`);
    router.push('/chat');
  };

  const pageInnerStyle: React.CSSProperties = {
    flex:      1,
    overflowY: 'auto',
    padding:   '24px 22px',
  };

  const cardStyle: React.CSSProperties = {
    background:   'rgba(13,30,17,0.8)',
    border:       '1px solid rgba(74,222,128,0.1)',
    borderRadius: 11,
    padding:      18,
    cursor:       'pointer',
    transition:   'all 0.18s',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div style={pageInnerStyle}>

        {!activePillar ? (
          <>
            <div className="text-[20px] font-bold text-white mb-1">Learning Resources</div>
            <div className="text-[12.5px] mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Explore all four pillars of the GGCL Academy curriculum
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {PILLARS.map(p => (
                <div
                  key={p.key}
                  style={cardStyle}
                  onClick={() => setActivePillar(p.key)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,222,128,0.28)';
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,222,128,0.1)';
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(0)';
                  }}
                >
                  <div className="text-[28px] mb-[10px]">{p.icon}</div>
                  <div className="text-[9.5px] tracking-[1.5px] uppercase mb-1" style={{ color: '#4ade80' }}>
                    {p.pillar}
                  </div>
                  <div className="text-[14px] font-bold text-white mb-1">{p.title}</div>
                  <div className="text-[12px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    {p.desc}
                  </div>
                  <div
                    className="text-[10.5px] pt-[9px]"
                    style={{ color: 'rgba(74,222,128,0.55)', borderTop: '1px solid rgba(74,222,128,0.09)' }}
                  >
                    {p.count}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : pillar ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setActivePillar(null)}
                className="px-3 py-[6px] rounded-[7px] text-[12.5px]"
                style={{
                  background:  'rgba(255,255,255,0.05)',
                  border:      '1px solid rgba(255,255,255,0.09)',
                  color:       'rgba(255,255,255,0.65)',
                }}
              >
                ← Back
              </button>
              <div className="text-[17px] font-bold text-white">{pillar.title}</div>
            </div>

            {pillar.sessions.map(session => (
              <div
                key={session}
                onClick={() => handleAsk(session)}
                className="rounded-[10px] px-4 py-[13px] mb-2 cursor-pointer transition-all duration-150"
                style={{
                  background: 'rgba(13,30,17,0.8)',
                  border:     '1px solid rgba(74,222,128,0.1)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,222,128,0.28)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(74,222,128,0.1)';
                }}
              >
                <div className="text-[13.5px] font-semibold text-white mb-1">{session}</div>
                <div className="text-[11.5px]" style={{ color: '#4ade80' }}>Ask Amara about this →</div>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}