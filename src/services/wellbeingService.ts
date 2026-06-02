import api                          from '../lib/axios';
import { WellbeingLog, MoodScore }   from '../types';

interface HistoryResponse {
  logs:       WellbeingLog[];
  total:      number;
  page:       number;
  totalPages: number;
  avgMood7d:  number | null;
}

export async function checkIn(mood: MoodScore, note = '', date?: string): Promise<WellbeingLog> {
  const { data } = await api.post<{ success: true; data: { log: WellbeingLog } }>(
    '/wellbeing',
    { mood, note, date: date ?? new Date().toISOString() },
  );
  return data.data.log;
}

export async function getTodayCheckIn(): Promise<WellbeingLog | null> {
  const { data } = await api.get<{ success: true; data: { log: WellbeingLog | null } }>(
    '/wellbeing/today',
  );
  return data.data.log;
}

export async function getWellbeingHistory(page = 1, limit = 30): Promise<HistoryResponse> {
  const { data } = await api.get<{ success: true; data: HistoryResponse }>(
    `/wellbeing?page=${page}&limit=${limit}`,
  );
  return data.data;
}

export async function deleteCheckIn(id: string): Promise<void> {
  await api.delete(`/wellbeing/${id}`);
}
