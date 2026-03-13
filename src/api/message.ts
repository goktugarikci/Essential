import apiClient from './apiClient';

export const getMessages = async (channelId: string, limit: number = 50, beforeId?: string) => {
  const url = beforeId 
    ? `/api/channels/${channelId}/messages?limit=${limit}&before=${beforeId}` 
    : `/api/channels/${channelId}/messages?limit=${limit}`;
  const { data } = await apiClient.get(url);
  return data;
};

export const sendMessage = async (channelId: string, content: string, attachments?: string[]) => {
  const { data } = await apiClient.post(`/api/channels/${channelId}/messages`, { content, attachments });
  return data;
};

export const editMessage = async (messageId: string, content: string) => {
  const { data } = await apiClient.put(`/api/messages/${messageId}`, { content });
  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { data } = await apiClient.delete(`/api/messages/${messageId}`);
  return data;
};

// --- Threads (Alt Yanıtlar) ---
export const createThread = async (messageId: string, name: string) => {
  const { data } = await apiClient.post(`/api/messages/${messageId}/threads`, { name });
  return data;
};

export const getThreadMessages = async (threadId: string) => {
  const { data } = await apiClient.get(`/api/threads/${threadId}/messages`);
  return data;
};

// --- Reactions (Tepkiler) ---
export const addReaction = async (messageId: string, emoji: string) => {
  const { data } = await apiClient.post(`/api/messages/${messageId}/reactions`, { emoji });
  return data;
};

export const removeReaction = async (messageId: string, emoji: string) => {
  const { data } = await apiClient.delete(`/api/messages/${messageId}/reactions/${emoji}`);
  return data;
};