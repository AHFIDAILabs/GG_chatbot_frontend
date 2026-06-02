'use client';

import { useState, useEffect, useCallback } from 'react';
import { WellbeingLog, MoodScore }           from '../types';
import * as wellbeingService                 from '../services/wellbeingService';

interface UseWellbeingReturn {
  todayLog:   WellbeingLog | null;
  history:    WellbeingLog[];
  avgMood7d:  number | null;
  loading:    boolean;
  saving:     boolean;
  checkIn:    (mood: MoodScore, note?: string) => Promise<void>;
  remove:     (id: string) => Promise<void>;
}

export function useWellbeing(): UseWellbeingReturn {
  const [todayLog,  setTodayLog]  = useState<WellbeingLog | null>(null);
  const [history,   setHistory]   = useState<WellbeingLog[]>([]);
  const [avgMood7d, setAvgMood7d] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      wellbeingService.getTodayCheckIn(),
      wellbeingService.getWellbeingHistory(1, 30),
    ])
      .then(([today, hist]) => {
        if (cancelled) return;
        setTodayLog(today);
        setHistory(hist.logs);
        setAvgMood7d(hist.avgMood7d);
      })
      .catch(() => null)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const checkIn = useCallback(async (mood: MoodScore, note = '') => {
    setSaving(true);
    try {
      const log = await wellbeingService.checkIn(mood, note);
      setTodayLog(log);
      setHistory(prev => {
        const filtered = prev.filter(l => l._id !== log._id && l.date.split('T')[0] !== log.date.split('T')[0]);
        return [log, ...filtered];
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await wellbeingService.deleteCheckIn(id);
    setHistory(prev => prev.filter(l => l._id !== id));
    if (todayLog?._id === id) setTodayLog(null);
  }, [todayLog]);

  return { todayLog, history, avgMood7d, loading, saving, checkIn, remove };
}
