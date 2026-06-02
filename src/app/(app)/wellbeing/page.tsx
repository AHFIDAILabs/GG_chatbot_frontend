'use client';

import { useState }    from 'react';
import { useWellbeing } from '../../../hooks';
import { MoodScore }    from '../../../types';

const MOOD_META: { score: MoodScore; emoji: string; label: string; color: string }[] = [
  { score: 5, emoji: '😄', label: 'Amazing',  color: '#4ade80' },
  { score: 4, emoji: '😊', label: 'Good',     color: '#86efac' },
  { score: 3, emoji: '😐', label: 'Okay',     color: '#fbbf24' },
  { score: 2, emoji: '😔', label: 'Low',      color: '#fb923c' },
  { score: 1, emoji: '😢', label: 'Struggling', color: '#f87171' },
];

function MoodBar({ value }: { value: number }) {
  const pct = ((value - 1) / 4) * 100;
  const color = value >= 4 ? '#4ade80' : value === 3 ? '#fbbf24' : '#f87171';
  return (
    <div className="h-[4px] rounded-full overflow-hidden w-full" style={{ background: 'var(--border-faint)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function WellbeingPage() {
  const { todayLog, history, avgMood7d, loading, saving, checkIn, remove } = useWellbeing();
  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null);
  const [note,          setNote]          = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  const handleCheckIn = async () => {
    if (!selectedMood) return;
    await checkIn(selectedMood, note);
    setSubmitted(true);
    setNote('');
  };

  const hasCheckedInToday = Boolean(todayLog);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-[22px]">
        <div className="text-[20px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>Daily Check-in</div>
        <div className="text-[12.5px] mb-5" style={{ color: 'var(--txt-4)' }}>
          Track how you feel each day
        </div>

        {/* 7-day average */}
        {avgMood7d !== null && (
          <div className="rounded-[11px] p-4 mb-4 flex items-center gap-4" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-strong)' }}>
            <div className="text-[30px]">{MOOD_META.find(m => m.score === Math.round(avgMood7d))?.emoji ?? '😐'}</div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: 'var(--txt-3)' }}>7-day mood average</div>
              <div className="text-[18px] font-bold" style={{ color: 'var(--accent)' }}>{avgMood7d.toFixed(1)} / 5</div>
            </div>
          </div>
        )}

        {/* Today's check-in */}
        {!loading && (
          <div className="rounded-[11px] p-4 mb-5" style={{ background: 'var(--surface-raised)', border: '1px solid var(--accent-dim)' }}>
            {hasCheckedInToday && !submitted ? (
              <div>
                <div className="text-[11px] mb-1" style={{ color: 'rgba(74,222,128,0.7)' }}>Today&apos;s check-in</div>
                <div className="flex items-center gap-2">
                  <span className="text-[28px]">{MOOD_META.find(m => m.score === todayLog!.mood)?.emoji}</span>
                  <div>
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--txt-1)' }}>{MOOD_META.find(m => m.score === todayLog!.mood)?.label}</div>
                    {todayLog!.note && <div className="text-[11.5px] mt-[2px]" style={{ color: 'var(--txt-3)' }}>{todayLog!.note}</div>}
                  </div>
                </div>
                <button
                  onClick={() => remove(todayLog!._id)}
                  className="mt-3 text-[11px]"
                  style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}
                >
                  Remove today&apos;s check-in
                </button>
              </div>
            ) : (
              <div>
                <div className="text-[12px] font-semibold mb-3" style={{ color: 'var(--txt-1)' }}>How are you feeling today?</div>
                <div className="flex justify-between mb-4">
                  {MOOD_META.map(m => (
                    <button
                      key={m.score}
                      onClick={() => setSelectedMood(m.score)}
                      className="flex flex-col items-center gap-1 p-2 rounded-[8px] transition-all"
                      style={{
                        background:  selectedMood === m.score ? `${m.color}18` : 'transparent',
                        border:      `1.5px solid ${selectedMood === m.score ? m.color : 'transparent'}`,
                        cursor:      'pointer',
                        transform:   selectedMood === m.score ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      <span className="text-[24px]">{m.emoji}</span>
                      <span className="text-[9.5px]" style={{ color: selectedMood === m.score ? m.color : 'var(--txt-4)' }}>{m.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Optional note… (how's your day going?)"
                  rows={2}
                  maxLength={300}
                  className="w-full bg-transparent text-[12.5px] outline-none resize-none mb-3"
                  style={{ borderBottom: '1px solid var(--border-faint)', color: 'var(--txt-2)', fontFamily: 'DM Sans, sans-serif', paddingBottom: 6 }}
                />
                <button
                  onClick={handleCheckIn}
                  disabled={!selectedMood || saving}
                  className="w-full py-[9px] rounded-[7px] font-semibold text-[13px] transition-opacity"
                  style={{
                    background: 'var(--accent-gradient)',
                    color:      '#09160d',
                    border:     'none',
                    cursor:     !selectedMood || saving ? 'not-allowed' : 'pointer',
                    opacity:    !selectedMood || saving ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Log Check-in'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--txt-5)' }}>History</div>
            {history.map(log => {
              const meta = MOOD_META.find(m => m.score === log.mood);
              return (
                <div
                  key={log._id}
                  className="flex items-center gap-3 py-[9px]"
                  style={{ borderBottom: '1px solid var(--border-faint)' }}
                >
                  <span className="text-[20px]">{meta?.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12.5px] font-medium" style={{ color: 'var(--txt-1)' }}>
                        {new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[11px]" style={{ color: meta?.color }}>{meta?.label}</span>
                    </div>
                    <MoodBar value={log.mood} />
                    {log.note && <div className="text-[11px] mt-1" style={{ color: 'var(--txt-4)' }}>{log.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
