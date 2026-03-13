'use client';

import { TrackerStats } from '../types';

const PHASE_PILL: Record<string, React.CSSProperties> = {
  Menstrual:  { background: 'rgba(239,68,68,0.15)',    color: '#f87171',  border: '1px solid rgba(239,68,68,0.25)' },
  Follicular: { background: 'rgba(74,222,128,0.12)',   color: '#4ade80',  border: '1px solid rgba(74,222,128,0.22)' },
  Ovulatory:  { background: 'rgba(167,139,250,0.12)',  color: '#c4b5fd',  border: '1px solid rgba(167,139,250,0.22)' },
  Luteal:     { background: 'rgba(251,191,36,0.12)',   color: '#fbbf24',  border: '1px solid rgba(251,191,36,0.22)' },
  Unknown:    { background: 'rgba(255,255,255,0.06)',  color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' },
};

interface StatsRowProps {
  stats: TrackerStats;
}

export default function StatsRow({ stats }: StatsRowProps) {
  const cardStyle: React.CSSProperties = {
    background: 'rgba(13,30,17,0.85)',
    border:     '1px solid rgba(74,222,128,0.1)',
    borderRadius: 11,
    padding:    16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize:      9.5,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.3)',
    marginBottom:  8,
  };

  const valStyle: React.CSSProperties = {
    fontSize:   24,
    fontWeight: 700,
    color:      '#4ade80',
    lineHeight: 1,
  };

  const subStyle: React.CSSProperties = {
    fontSize:   11,
    color:      'rgba(255,255,255,0.35)',
    marginTop:  4,
  };

  const nextVal  = stats.nextPeriodDays === null
    ? '—'
    : stats.nextPeriodDays <= 0
      ? 'Today'
      : `${stats.nextPeriodDays}d`;

  const nextSub  = stats.nextPeriodDate
    ? new Date(stats.nextPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Log to predict';

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
      {/* Next period */}
      <div style={cardStyle}>
        <div style={labelStyle}>Next Period</div>
        <div style={valStyle}>{nextVal}</div>
        <div style={subStyle}>{nextSub}</div>
      </div>

      {/* Avg cycle */}
      <div style={cardStyle}>
        <div style={labelStyle}>Cycle Length</div>
        <div style={valStyle}>{stats.logsCount < 2 ? '—' : `${stats.avgCycleLength}d`}</div>
        <div style={subStyle}>Avg from logs</div>
      </div>

      {/* Avg period */}
      <div style={cardStyle}>
        <div style={labelStyle}>Period Length</div>
        <div style={valStyle}>{stats.logsCount < 1 ? '—' : `${stats.avgPeriodLength}d`}</div>
        <div style={subStyle}>Avg duration</div>
      </div>

      {/* Current phase */}
      <div style={cardStyle}>
        <div style={labelStyle}>Phase Today</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', lineHeight: 1 }}>
          {stats.currentPhase === 'Unknown' ? '—' : stats.currentPhase}
        </div>
        <div
          className="inline-block px-2 py-[2px] rounded-lg text-[11px] font-semibold mt-[5px]"
          style={PHASE_PILL[stats.currentPhase]}
        >
          {stats.currentPhase}
        </div>
      </div>
    </div>
  );
}