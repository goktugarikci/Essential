import apiClient from './apiClient';
import { KanbanCardData } from './types';

export const getBoards = async (serverId: string) => {
  const { data } = await apiClient.get(`/api/servers/${serverId}/boards`);
  return data;
};

export const createList = async (boardId: string, name: string) => {
  const { data } = await apiClient.post(`/api/boards/${boardId}/lists`, { name });
  return data;
};

export const createCard = async (cardData: KanbanCardData) => {
  const { data } = await apiClient.post(`/api/lists/${cardData.list_id}/cards`, cardData);
  return data;
};

export const assignUserToCard = async (cardId: string, userId: string) => {
  const { data } = await apiClient.post(`/api/cards/${cardId}/assignments`, { user_id: userId });
  return data;
};
export const updateCard = async (cardId: string, updateData: any) => {
  const { data } = await apiClient.put(`/api/cards/${cardId}`, updateData);
  return data;
};

export const deleteCard = async (cardId: string) => {
  const { data } = await apiClient.delete(`/api/cards/${cardId}`);
  return data;
};

// Sürükle-bırak (Drag & Drop) için kartı başka listeye taşıma
export const moveCard = async (cardId: string, newListId: string, newPosition: number) => {
  const { data } = await apiClient.put(`/api/cards/${cardId}/move`, { list_id: newListId, position: newPosition });
  return data;
};

export const addCardComment = async (cardId: string, text: string) => {
  const { data } = await apiClient.post(`/api/cards/${cardId}/comments`, { text });
  return data;
};

export const setCardDeadline = async (cardId: string, deadline: string) => {
  const { data } = await apiClient.put(`/api/cards/${cardId}/deadline`, { deadline });
  return data;
};

export const addCardLabel = async (cardId: string, color: string, name: string) => {
  const { data } = await apiClient.post(`/api/cards/${cardId}/labels`, { color, name });
  return data;
};