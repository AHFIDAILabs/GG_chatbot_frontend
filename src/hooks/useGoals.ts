'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalPillar, GoalStatus }      from '../types';
import * as goalsService                     from '../services/goalsService';

interface UseGoalsReturn {
  goals:        Goal[];
  loading:      boolean;
  saving:       boolean;
  createGoal:   (title: string, pillar: GoalPillar, deadline?: string | null, steps?: string[]) => Promise<void>;
  updateGoal:   (id: string, updates: { title?: string; pillar?: GoalPillar; deadline?: string | null; status?: GoalStatus }) => Promise<void>;
  toggleStep:   (goalId: string, stepId: string, done: boolean) => Promise<void>;
  deleteGoal:   (id: string) => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
  const [goals,   setGoals]   = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    goalsService.getGoals()
      .then(setGoals)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const createGoal = useCallback(async (
    title:    string,
    pillar:   GoalPillar,
    deadline: string | null = null,
    steps:    string[]      = [],
  ) => {
    setSaving(true);
    try {
      const goal = await goalsService.createGoal({
        title,
        pillar,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        steps,
      });
      setGoals(prev => [goal, ...prev]);
    } finally {
      setSaving(false);
    }
  }, []);

  const updateGoal = useCallback(async (
    id:      string,
    updates: { title?: string; pillar?: GoalPillar; deadline?: string | null; status?: GoalStatus },
  ) => {
    const updated = await goalsService.updateGoal(id, {
      ...updates,
      deadline: updates.deadline ? new Date(updates.deadline).toISOString() : updates.deadline,
    });
    setGoals(prev => prev.map(g => g._id === id ? updated : g));
  }, []);

  const toggleStep = useCallback(async (goalId: string, stepId: string, done: boolean) => {
    // Optimistic
    setGoals(prev => prev.map(g =>
      g._id !== goalId ? g : {
        ...g,
        steps: g.steps.map(s => s._id === stepId ? { ...s, done } : s),
      },
    ));
    try {
      const updated = await goalsService.updateStep(goalId, stepId, done);
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
    } catch {
      // Revert optimistic update on failure
      setGoals(prev => prev.map(g =>
        g._id !== goalId ? g : {
          ...g,
          steps: g.steps.map(s => s._id === stepId ? { ...s, done: !done } : s),
        },
      ));
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    setGoals(prev => prev.filter(g => g._id !== id));
    await goalsService.deleteGoal(id);
  }, []);

  return { goals, loading, saving, createGoal, updateGoal, toggleStep, deleteGoal };
}
