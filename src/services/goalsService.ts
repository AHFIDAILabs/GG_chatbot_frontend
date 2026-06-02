import api                        from '../lib/axios';
import { Goal, GoalPillar, GoalStatus } from '../types';

export async function getGoals(status?: GoalStatus, pillar?: GoalPillar): Promise<Goal[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (pillar) params.set('pillar', pillar);
  const { data } = await api.get<{ success: true; data: { goals: Goal[] } }>(
    `/goals?${params.toString()}`,
  );
  return data.data.goals;
}

export async function createGoal(payload: {
  title:     string;
  pillar?:   GoalPillar;
  deadline?: string | null;
  steps?:    string[];
}): Promise<Goal> {
  const { data } = await api.post<{ success: true; data: { goal: Goal } }>('/goals', payload);
  return data.data.goal;
}

export async function updateGoal(
  id:      string,
  updates: { title?: string; pillar?: GoalPillar; deadline?: string | null; status?: GoalStatus },
): Promise<Goal> {
  const { data } = await api.patch<{ success: true; data: { goal: Goal } }>(`/goals/${id}`, updates);
  return data.data.goal;
}

export async function updateStep(goalId: string, stepId: string, done: boolean): Promise<Goal> {
  const { data } = await api.patch<{ success: true; data: { goal: Goal } }>(
    `/goals/${goalId}/steps/${stepId}`,
    { done },
  );
  return data.data.goal;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}
