'use client';

import { useState } from 'react';
import { CalendarDateSets } from '../lib/tracker';

interface CalendarProps {
  dateSets: CalendarDateSets;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS     = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getDayStyle(
  key:     string,
  isToday: boolean,
  sets:    CalendarDateSets,
): React.CSSProperties {
  if (sets.periodDates.has(key))    return { background: 'rgba(239,68,68,0.18)',   border: '1px solid rgba(239,68,68,0.32)',   color: '#fca5a5' };
  // if (sets.ovulationDates.has(key)) return { ... };   // Ovulation — hidden for now
  // if (sets.fertileDates.has(key))   return { ... };   // Fertile window — hidden for now
  if (sets.predictedDates.has(key)) return { background: 'rgba(251,191,36,0.09)', border: '1px solid rgba(251,191,36,0.22)', color: '#fbbf24' };
  if (isToday)                      return { background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.38)', color: '#4ade80', fontWeight: 700 };
  return { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', color: 'rgba(255,255,255,0.45)' };
}

export default function Calendar({ dateSets }: CalendarProps) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today     = now.toISOString().split('T')[0];
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];

  return (
    <div
      className="rounded-[11px] p-4"
      style={{ background: 'rgba(13,30,17,0.85)', border: '1px solid rgba(74,222,128,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="px-[9px] py-[3px] rounded-[6px] text-[13px]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
        >‹</button>
        <span className="text-[13.5px] font-semibold text-white">{MONTHS[month]} {year}</span>
        <button
          onClick={nextMonth}
          className="px-[9px] py-[3px] rounded-[6px] text-[13px]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
        >›</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-[3px]">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center py-[3px] text-[9.5px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key     = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = key === today;
          const style   = getDayStyle(key, isToday, dateSets);
          return (
            <div
              key={key}
              className="aspect-square rounded-[5px] flex items-center justify-center text-[11.5px] cursor-pointer transition-all duration-100"
              style={style}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend — fertile window removed */}
      <div className="flex gap-3 mt-3 flex-wrap">
        {[
          { color: 'rgba(239,68,68,0.4)',  border: 'rgba(239,68,68,0.6)',  label: 'Period'    },
          { color: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.4)', label: 'Predicted' },
          { color: 'rgba(74,222,128,0.2)', border: 'rgba(74,222,128,0.4)', label: 'Today'     },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
            <div className="w-[9px] h-[9px] rounded-[2px] shrink-0" style={{ background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}