'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuid }                        from 'uuid';
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
} from '../types';

// ─────────────────────────────────────────────
// useTracker
//
// Manages the period tracker state entirely in
// localStorage — never calls the backend.
//
// Usage:
//   const {
//     periodLogs, symptomLogs, stats, calendar,
//     addPeriodLog, updatePeriodLog, removePeriodLog,
//     addSymptomLog,
//   } = useTracker();
// ─────────────────────────────────────────────

interface UseTrackerReturn {
  periodLogs:      PeriodLog[];
  symptomLogs:     SymptomLog[];
  stats:           TrackerStats;
  calendar:        CalendarDateSets;

  addPeriodLog:    (date: string, flow: FlowIntensity, duration: number, notes: string) => void;
  updatePeriodLog: (id: string, updates: Partial<Omit<PeriodLog, 'id'>>) => void;
  removePeriodLog: (id: string) => void;

  addSymptomLog:   (date: string, mood: MoodType | null, symptoms: string[]) => void;
  removeSymptomLog:(id: string) => void;
}

export function useTracker(): UseTrackerReturn {
  const [periodLogs,  setPeriodLogs]  = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);

  // ── Load from localStorage on mount ───────
  useEffect(() => {
    setPeriodLogs(loadPeriodLogs());
    setSymptomLogs(loadSymptomLogs());
  }, []);

  // ── Period log actions ─────────────────────

  const addPeriodLog = useCallback((
    date:     string,
    flow:     FlowIntensity,
    duration: number,
    notes:    string
  ) => {
    const newLog: PeriodLog = { id: uuid(), date, flow, duration, notes };
    setPeriodLogs(prev => {
      // Prevent duplicate entries for the same date
      const filtered = prev.filter(l => l.date !== date);
      const updated  = [newLog, ...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      savePeriodLogs(updated);
      return updated;
    });
  }, []);

  const updatePeriodLog = useCallback((
    id:      string,
    updates: Partial<Omit<PeriodLog, 'id'>>
  ) => {
    setPeriodLogs(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      savePeriodLogs(updated);
      return updated;
    });
  }, []);

  const removePeriodLog = useCallback((id: string) => {
    setPeriodLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      savePeriodLogs(updated);
      return updated;
    });
  }, []);

  // ── Symptom log actions ────────────────────

  const addSymptomLog = useCallback((
    date:     string,
    mood:     MoodType | null,
    symptoms: string[]
  ) => {
    const newLog: SymptomLog = { id: uuid(), date, mood, symptoms };
    setSymptomLogs(prev => {
      // One symptom entry per day — replace if exists
      const filtered = prev.filter(l => l.date !== date);
      const updated  = [newLog, ...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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

  // ── Derived state ──────────────────────────
  const stats    = getTrackerStats(periodLogs);
  const calendar = getCalendarDateSets(periodLogs);

  return {
    periodLogs,
    symptomLogs,
    stats,
    calendar,
    addPeriodLog,
    updatePeriodLog,
    removePeriodLog,
    addSymptomLog,
    removeSymptomLog,
  };
}