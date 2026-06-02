import api               from '../lib/axios';
import { PeriodLog, CyclePrediction, FlowIntensity } from '../types';

interface PeriodLogsResponse {
  logs:       PeriodLog[];
  total:      number;
  page:       number;
  totalPages: number;
}

// Normalise backend doc (_id, startDate) → local shape (id, date)
function normalise(doc: any): PeriodLog {
  return {
    id:       (doc._id ?? doc.id) as string,
    _id:      doc._id as string,
    date:     ((doc.startDate ?? doc.date) as string).split('T')[0],
    flow:     (doc.flow as FlowIntensity) ?? 'medium',
    duration: (doc.duration as number | null) ?? null,
    notes:    (doc.notes as string) ?? '',
  };
}

export async function fetchPeriodLogs(page = 1, limit = 12): Promise<PeriodLogsResponse> {
  const { data } = await api.get<{ success: true; data: PeriodLogsResponse }>(
    `/tracker?page=${page}&limit=${limit}`,
  );
  const d = data.data;
  return { ...d, logs: (d.logs as any[]).map(normalise) };
}

export async function logPeriod(
  startDate: string,
  flow:      FlowIntensity,
  endDate?:  string | null,
  notes?:    string,
): Promise<PeriodLog> {
  const { data } = await api.post<{ success: true; data: { log: Record<string, unknown> } }>(
    '/tracker',
    { startDate: new Date(startDate).toISOString(), endDate: endDate ?? null, flow, notes: notes ?? '' },
  );
  return normalise(data.data.log);
}

export async function updatePeriodLog(
  id:      string,
  updates: { endDate?: string | null; flow?: FlowIntensity; notes?: string },
): Promise<PeriodLog> {
  const payload = {
    ...updates,
    endDate: updates.endDate ? new Date(updates.endDate).toISOString() : updates.endDate,
  };
  const { data } = await api.patch<{ success: true; data: { log: Record<string, unknown> } }>(
    `/tracker/${id}`,
    payload,
  );
  return normalise(data.data.log);
}

export async function deletePeriodLog(id: string): Promise<void> {
  await api.delete(`/tracker/${id}`);
}

export async function fetchPrediction(): Promise<CyclePrediction | null> {
  const { data } = await api.get<{ success: true; data: { prediction: CyclePrediction | null } }>(
    '/tracker/prediction',
  );
  return data.data.prediction;
}
