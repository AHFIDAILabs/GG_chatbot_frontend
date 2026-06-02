import api from '../lib/axios';

interface ProgressData {
  savedTopics:      string[];
  resourcesVisited: string[];
  badges:           string[];
}

export async function getProgress(): Promise<ProgressData> {
  const { data } = await api.get<{ success: true; data: ProgressData }>(
    '/auth/resources/visited',
  );
  return data.data;
}

export async function markVisited(topicId: string): Promise<ProgressData> {
  const { data } = await api.post<{ success: true; data: { resourcesVisited: string[]; badges: string[] } }>(
    '/auth/resources/visited',
    { topicId },
  );
  return { ...data.data, savedTopics: [] }; // savedTopics returned separately
}

export async function addBookmark(topicId: string): Promise<string[]> {
  const { data } = await api.post<{ success: true; data: { savedTopics: string[] } }>(
    '/auth/bookmarks',
    { topicId },
  );
  return data.data.savedTopics;
}

export async function removeBookmark(topicId: string): Promise<string[]> {
  const { data } = await api.delete<{ success: true; data: { savedTopics: string[] } }>(
    `/auth/bookmarks/${topicId}`,
  );
  return data.data.savedTopics;
}

export async function getBookmarks(): Promise<string[]> {
  const { data } = await api.get<{ success: true; data: { savedTopics: string[] } }>(
    '/auth/bookmarks',
  );
  return data.data.savedTopics;
}
