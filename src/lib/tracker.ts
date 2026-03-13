import { PeriodLog, SymptomLog, TrackerStats, CyclePhase } from '../types';

// ─────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────

export const STORAGE_KEYS = {
  PERIOD_LOGS:  'ggcl_period_logs',
  SYMPTOM_LOGS: 'ggcl_symptom_logs',
} as const;

// ─────────────────────────────────────────────
// LocalStorage helpers
// ─────────────────────────────────────────────

export function loadPeriodLogs(): PeriodLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERIOD_LOGS) ?? '[]');
  } catch {
    return [];
  }
}

export function savePeriodLogs(logs: PeriodLog[]): void {
  localStorage.setItem(STORAGE_KEYS.PERIOD_LOGS, JSON.stringify(logs));
}

export function loadSymptomLogs(): SymptomLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SYMPTOM_LOGS) ?? '[]');
  } catch {
    return [];
  }
}

export function saveSymptomLogs(logs: SymptomLog[]): void {
  localStorage.setItem(STORAGE_KEYS.SYMPTOM_LOGS, JSON.stringify(logs));
}

// ─────────────────────────────────────────────
// Cycle calculations
// ─────────────────────────────────────────────

export function getAvgCycleLength(logs: PeriodLog[]): number {
  if (logs.length < 2) return 28;
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86_400_000;
  }
  return Math.round(total / (sorted.length - 1));
}

export function getAvgPeriodLength(logs: PeriodLog[]): number {
  if (!logs.length) return 5;
  return Math.round(logs.reduce((s, l) => s + l.duration, 0) / logs.length);
}

export function getCurrentPhase(logs: PeriodLog[]): CyclePhase {
  if (!logs.length) return 'Unknown';
  const sorted   = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastStart = new Date(sorted[0].date);
  const avgCycle  = getAvgCycleLength(logs);
  const avgDur    = getAvgPeriodLength(logs);
  const today     = new Date();
  const dayInCycle = Math.round((today.getTime() - lastStart.getTime()) / 86_400_000) % avgCycle;
  if (dayInCycle < 0)          return 'Unknown';
  if (dayInCycle < avgDur)     return 'Menstrual';
  if (dayInCycle < 10)         return 'Follicular';
  if (dayInCycle < 17)         return 'Ovulatory';
  return 'Luteal';
}

export function getTrackerStats(logs: PeriodLog[]): TrackerStats {
  const avgCycle  = getAvgCycleLength(logs);
  const avgDur    = getAvgPeriodLength(logs);
  const phase     = getCurrentPhase(logs);

  if (!logs.length) {
    return {
      nextPeriodDays:  null,
      nextPeriodDate:  null,
      avgCycleLength:  avgCycle,
      avgPeriodLength: avgDur,
      currentPhase:    phase,
      logsCount:       0,
    };
  }

  const sorted   = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last      = new Date(sorted[0].date);
  const next      = new Date(last);
  next.setDate(last.getDate() + avgCycle);
  const daysUntil = Math.round((next.getTime() - new Date().getTime()) / 86_400_000);

  return {
    nextPeriodDays:  daysUntil,
    nextPeriodDate:  next.toISOString().split('T')[0],
    avgCycleLength:  avgCycle,
    avgPeriodLength: avgDur,
    currentPhase:    phase,
    logsCount:       logs.length,
  };
}

// ─────────────────────────────────────────────
// Calendar date sets for a given month
// Returns sets of date strings for each type
// ─────────────────────────────────────────────

export interface CalendarDateSets {
  periodDates:    Set<string>;
  predictedDates: Set<string>;
  fertileDates:   Set<string>;
  ovulationDates: Set<string>;
}

export function getCalendarDateSets(logs: PeriodLog[]): CalendarDateSets {
  const periodDates    = new Set<string>();
  const predictedDates = new Set<string>();
  const fertileDates   = new Set<string>();
  const ovulationDates = new Set<string>();

  const avgCycle = getAvgCycleLength(logs);
  const avgDur   = getAvgPeriodLength(logs);

  logs.forEach(log => {
    const start = new Date(log.date);

    // Actual period days
    for (let d = 0; d < log.duration; d++) {
      const dd = new Date(start);
      dd.setDate(start.getDate() + d);
      periodDates.add(dd.toISOString().split('T')[0]);
    }

    // Fertile window (~day 10–16) and ovulation (~day 14)
    const fertileStart = new Date(start);
    fertileStart.setDate(start.getDate() + 9);
    for (let d = 0; d < 7; d++) {
      const dd = new Date(fertileStart);
      dd.setDate(fertileStart.getDate() + d);
      const key = dd.toISOString().split('T')[0];
      if (!periodDates.has(key)) fertileDates.add(key);
    }
    const ovDay = new Date(start);
    ovDay.setDate(start.getDate() + 13);
    ovulationDates.add(ovDay.toISOString().split('T')[0]);

    // Predict next 4 cycles
    for (let c = 1; c <= 4; c++) {
      const nextStart = new Date(start);
      nextStart.setDate(start.getDate() + avgCycle * c);
      for (let d = 0; d < avgDur; d++) {
        const dd = new Date(nextStart);
        dd.setDate(nextStart.getDate() + d);
        const key = dd.toISOString().split('T')[0];
        if (!periodDates.has(key)) predictedDates.add(key);
      }
      // Predicted fertile window
      const nf = new Date(nextStart);
      nf.setDate(nextStart.getDate() + 9);
      for (let d = 0; d < 7; d++) {
        const dd = new Date(nf);
        dd.setDate(nf.getDate() + d);
        const key = dd.toISOString().split('T')[0];
        if (!periodDates.has(key) && !predictedDates.has(key)) fertileDates.add(key);
      }
    }
  });

  return { periodDates, predictedDates, fertileDates, ovulationDates };
}

// ─────────────────────────────────────────────
// Markdown renderer
// Converts **bold**, *italic*, - bullets
// Mirrors prototype renderMD()
// ─────────────────────────────────────────────

export function renderMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => {
      if (!line.trim()) return '<div class="h-1"></div>';
      const isBullet = line.startsWith('- ');
      let raw = isBullet ? line.slice(2) : line;
      raw = raw
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return isBullet
        ? `<div class="flex gap-2 mb-1"><span class="text-green-400 shrink-0">▸</span><span>${raw}</span></div>`
        : `<p class="mb-1">${raw}</p>`;
    })
    .join('');
}