'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  loadPeriodLogs,
  savePeriodLogs,
  loadSymptomLogs,
  saveSymptomLogs,
  getTrackerStats,
  getCalendarDateSets,
  CalendarDateSets,
} from '../lib/tracker';
import {
  PeriodLog,
  SymptomLog,
  TrackerStats,
  FlowIntensity,
  MoodType,
  CyclePrediction,
} from '../types';
import * as trackerService from '../services/trackerService';

interface UseTrackerReturn {
  periodLogs:      PeriodLog[];
  symptomLogs:     SymptomLog[];
  stats:           TrackerStats;
  calendar:        CalendarDateSets;
  prediction:      CyclePrediction | null;
  loading:         boolean;

  addPeriodLog:    (date: string, flow: FlowIntensity, duration: number, notes: string) => Promise<void>;
  updatePeriodLog: (id: string, updates: Partial<Omit<PeriodLog, 'id'>>) => Promise<void>;
  removePeriodLog: (id: string) => Promise<void>;

  addSymptomLog:   (date: string, mood: MoodType | null, symptoms: string[]) => void;
  removeSymptomLog:(id: string) => void;
}

export function useTracker(): UseTrackerReturn {
  const [periodLogs,  setPeriodLogs]  = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [prediction,  setPrediction]  = useState<CyclePrediction | null>(null);
  const [loading,     setLoading]     = useState(true);

  // ── Bootstrap: try API first, fallback to localStorage ────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await trackerService.fetchPeriodLogs(1, 50);
        if (!cancelled) {
          setPeriodLogs(res.logs);
          savePeriodLogs(res.logs); // keep localStorage in sync
        }
        const pred = await trackerService.fetchPrediction();
        if (!cancelled) setPrediction(pred);
      } catch {
        // Not logged in or network error — load from localStorage
        if (!cancelled) setPeriodLogs(loadPeriodLogs());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    setSymptomLogs(loadSymptomLogs());

    return () => { cancelled = true; };
  }, []);

  // ── Period log actions (API + optimistic local state) ─────────────────

  const addPeriodLog = useCallback(async (
    date:     string,
    flow:     FlowIntensity,
    duration: number,
    notes:    string,
  ) => {
    // Build endDate from date + duration
    const start  = new Date(date);
    const end    = new Date(start.getTime() + duration * 86_400_000);

    try {
      const saved = await trackerService.logPeriod(
        start.toISOString(),
        flow,
        end.toISOString(),
        notes,
      );
      setPeriodLogs(prev => {
        const filtered = prev.filter(l => l.date !== date);
        const updated  = [saved, ...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        savePeriodLogs(updated);
        return updated;
      });
      // Refresh prediction after new log
      trackerService.fetchPrediction().then(setPrediction).catch(() => null);
    } catch {
      // Fallback: save locally only
      const local: PeriodLog = { id: crypto.randomUUID(), date, flow, duration, notes };
      setPeriodLogs(prev => {
        const filtered = prev.filter(l => l.date !== date);
        const updated  = [local, ...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        savePeriodLogs(updated);
        return updated;
      });
    }
  }, []);

  const updatePeriodLog = useCallback(async (
    id:      string,
    updates: Partial<Omit<PeriodLog, 'id'>>,
  ) => {
    try {
      const saved = await trackerService.updatePeriodLog(id, {
        flow:  updates.flow,
        notes: updates.notes,
      });
      setPeriodLogs(prev => {
        const updated = prev.map(l => l.id === id ? saved : l);
        savePeriodLogs(updated);
        return updated;
      });
    } catch {
      setPeriodLogs(prev => {
        const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
        savePeriodLogs(updated);
        return updated;
      });
    }
  }, []);

  const removePeriodLog = useCallback(async (id: string) => {
    // Optimistic removal
    setPeriodLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      savePeriodLogs(updated);
      return updated;
    });
    try {
      await trackerService.deletePeriodLog(id);
    } catch {
      // If delete fails, refetch to restore correct state
      trackerService.fetchPeriodLogs(1, 50)
        .then(r => { setPeriodLogs(r.logs); savePeriodLogs(r.logs); })
        .catch(() => null);
    }
  }, []);

  // ── Symptom log actions (local only) ──────────────────────────────────

  const addSymptomLog = useCallback((
    date:     string,
    mood:     MoodType | null,
    symptoms: string[],
  ) => {
    const newLog: SymptomLog = { id: crypto.randomUUID(), date, mood, symptoms };
    setSymptomLogs(prev => {
      const filtered = prev.filter(l => l.date !== date);
      const updated  = [newLog, ...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      saveSymptomLogs(updated);
      return updated;
    });
  }, []);

  const removeSymptomLog = useCallback((id: string) => {
    setSymptomLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveSymptomLogs(updated);
      return updated;
    });
  }, []);

  const stats    = getTrackerStats(periodLogs);
  const calendar = getCalendarDateSets(periodLogs);

  return {
    periodLogs,
    symptomLogs,
    stats,
    calendar,
    prediction,
    loading,
    addPeriodLog,
    updatePeriodLog,
    removePeriodLog,
    addSymptomLog,
    removeSymptomLog,
  };
}
