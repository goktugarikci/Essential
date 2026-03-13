import apiClient from './apiClient';

export interface NotificationData {
  id: string;
  type: 'NEW_MESSAGE' | 'FRIEND_REQUEST' | 'MENTION' | 'SYSTEM';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async () => {
  const { data } = await apiClient.get('/api/notifications');
  return data;
};

export const markAsRead = async (notificationId: string) => {
  const { data } = await apiClient.put(`/api/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await apiClient.put('/api/notifications/read-all');
  return data;
};