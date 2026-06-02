'use client';

import { TrackerStats } from '../types';

const PHASE_PILL: Record<string, React.CSSProperties> = {
  Menstrual:  { background: 'rgba(239,68,68,0.15)',   color: '#ef4444',  border: '1px solid rgba(239,68,68,0.3)'  },
  Follicular: { background: 'var(--accent-dim)',       color: 'var(--accent)', border: '1px solid var(--border-strong)' },
  Ovulatory:  { background: 'rgba(167,139,250,0.12)', color: '#7c3aed',  border: '1px solid rgba(167,139,250,0.3)' },
  Luteal:     { background: 'rgba(251,191,36,0.12)',  color: '#d97706',  border: '1px solid rgba(251,191,36,0.3)'  },
  Unknown:    { background: 'var(--surface-alt)',      color: 'var(--txt-3)', border: '1px solid var(--border)' },
};

interface StatsRowProps {
  stats: TrackerStats;
}

export default function StatsRow({ stats }: StatsRowProps) {
  const cardStyle: React.CSSProperties = {
    background:   'var(--surface-raised)',
    border:       '1px solid var(--border)',
    borderRadius: 11,
    padding:      16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize:      9.5,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color:         'var(--txt-4)',
    marginBottom:  8,
  };

  const valStyle: React.CSSProperties = {
    fontSize:   24,
    fontWeight: 700,
    color:      'var(--accent)',
    lineHeight: 1,
  };

  const subStyle: React.CSSProperties = {
    fontSize:  11,
    color:     'var(--txt-4)',
    marginTop: 4,
  };

  const nextVal = stats.nextPeriodDays === null
    ? '—'
    : stats.nextPeriodDays <= 0
      ? 'Today'
      : `${stats.nextPeriodDays}d`;

  const nextSub = stats.nextPeriodDate
    ? new Date(stats.nextPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Log to predict';

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
      <div style={cardStyle}>
        <div style={labelStyle}>Next Period</div>
        <div style={valStyle}>{nextVal}</div>
        <div style={subStyle}>{nextSub}</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Cycle Length</div>
        <div style={valStyle}>{stats.logsCount < 2 ? '—' : `${stats.avgCycleLength}d`}</div>
        <div style={subStyle}>Avg from logs</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Period Length</div>
        <div style={valStyle}>{stats.logsCount < 1 ? '—' : `${stats.avgPeriodLength}d`}</div>
        <div style={subStyle}>Avg duration</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Phase Today</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
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
