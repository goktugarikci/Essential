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
  const { data } = await apiClient.get('/notifications');
  return data;
};

export const markAsRead = async (notificationId: string) => {
  const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await apiClient.put('/notifications/read-all');
  return data;
};